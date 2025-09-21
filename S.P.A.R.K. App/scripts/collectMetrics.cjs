// Hardhat-powered metrics collector for Kaia Kairos testnet
// Usage: npx hardhat run scripts/collectMetrics.cjs --network kaiaTestnet

/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { ethers, artifacts, network } = require('hardhat');

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true }).catch(() => {});
}

function toBN(val) {
  try {
    if (typeof val === 'bigint') return val;
    if (ethers.isHexString?.(val)) return BigInt(val);
    if (typeof val === 'string') return BigInt(val);
    if (val?._isBigNumber || val?._hex) return BigInt(val._hex);
  } catch (_) {}
  try {
    return BigInt(val);
  } catch (_) {
    return 0n;
  }
}

function safeFormatEther(bi) {
  try { return ethers.formatEther(bi); } catch (_) { return bi.toString(); }
}

function pickAmount(args) {
  // Try common field names in order
  const candidates = ['amount', 'value', 'principal', 'repaymentAmount', 'total', 'sum'];
  for (const key of candidates) {
    if (args?.[key] !== undefined) return toBN(args[key]);
  }
  // Fallback: first numeric-looking arg
  if (Array.isArray(args)) {
    for (const a of args) {
      const bn = toBN(a);
      if (bn !== 0n) return bn;
    }
  }
  return 0n;
}

async function loadDeployment() {
  const deploymentPath = path.join(__dirname, '..', 'deployment.json');
  const raw = await fs.promises.readFile(deploymentPath, 'utf8');
  return JSON.parse(raw);
}

async function getContract(name, address) {
  const art = await artifacts.readArtifact(name);
  const contract = new ethers.Contract(address, art.abi, ethers.provider);
  return { contract, abi: art.abi };
}

async function collectEvents(address, abi, fromBlock) {
  const iface = new ethers.Interface(abi);
  const latest = await ethers.provider.getBlockNumber();
  const logs = await ethers.provider.getLogs({ address, fromBlock, toBlock: latest });
  const parsed = [];
  for (const log of logs) {
    try {
      const pl = iface.parseLog({ topics: log.topics, data: log.data });
      parsed.push({
        name: pl.name,
        args: pl.args,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
      });
    } catch (_) {
      // ignore non-matching logs (e.g., proxy or unknown events)
    }
  }
  return parsed;
}

async function main() {
  console.log(`🔍 Collecting metrics on network: ${network.name}`);
  const deployment = await loadDeployment();

  const contracts = {
    TrustMatrixScorer: deployment.TrustMatrixScorer,
    KaiaSparkFactory: deployment.KaiaSparkFactory,
    SocialMarketingAI: deployment.SocialMarketingAI,
    QuantumLendingPool: deployment.QuantumLendingPool,
  };

  // From genesis on Kairos; adjust if needed
  const fromBlock = 0;

  const out = {
    network: deployment.network || network.name,
    chainId: deployment.chainId || undefined,
    asOf: new Date().toISOString(),
    contracts,
    metrics: {
      lending: { loansCreated: 0, totalPrincipal: '0', loanRepayments: 0, totalRepaid: '0', uniqueBorrowers: 0, uniqueInvestors: 0 },
      marketing: { campaigns: 0, couponsClaimed: 0, uniqueClaimers: 0, viralShares: 0 },
      business: { businessesRegistered: 0 },
      trust: { usersRegistered: 0, trustUpdates: 0 },
    },
    eventCounts: {},
    samples: {},
  };

  const eventBuckets = {};
  async function processContract(name, address) {
    if (!address) return;
    const { abi } = await artifacts.readArtifact(name);
    const events = await collectEvents(address, abi, fromBlock);
    eventBuckets[name] = events;

    // Count all events by name
    for (const e of events) {
      out.eventCounts[e.name] = (out.eventCounts[e.name] || 0) + 1;
    }
  }

  await processContract('TrustMatrixScorer', contracts.TrustMatrixScorer);
  await processContract('KaiaSparkFactory', contracts.KaiaSparkFactory);
  await processContract('SocialMarketingAI', contracts.SocialMarketingAI);
  await processContract('QuantumLendingPool', contracts.QuantumLendingPool);

  // Compute specific metrics with best-effort heuristics
  const lending = eventBuckets.QuantumLendingPool || [];
  const marketing = eventBuckets.SocialMarketingAI || [];
  const factory = eventBuckets.KaiaSparkFactory || [];
  const trust = eventBuckets.TrustMatrixScorer || [];

  // Lending
  const borrowers = new Set();
  const investors = new Set();
  let principalSum = 0n;
  let repaidSum = 0n;

  for (const e of lending) {
    const name = e.name.toLowerCase();
    if (name.includes('loancreated')) {
      out.metrics.lending.loansCreated += 1;
      // borrower is often at index 1 or named 'borrower'
      const b = e.args?.borrower || e.args?.[1];
      if (b) borrowers.add((b + '').toLowerCase());
      principalSum += pickAmount(e.args);
    } else if (name.includes('loanrepay')) {
      out.metrics.lending.loanRepayments += 1;
      repaidSum += pickAmount(e.args);
    } else if (name.includes('investment')) {
      // e.g., InvestmentMade / InvestorJoined
      const inv = e.args?.investor || e.args?.lender || e.args?.[1];
      if (inv) investors.add((inv + '').toLowerCase());
    }
  }
  out.metrics.lending.totalPrincipal = safeFormatEther(principalSum);
  out.metrics.lending.totalRepaid = safeFormatEther(repaidSum);
  out.metrics.lending.uniqueBorrowers = borrowers.size;
  out.metrics.lending.uniqueInvestors = investors.size;

  // Marketing
  const claimers = new Set();
  for (const e of marketing) {
    const name = e.name.toLowerCase();
    if (name.includes('campaigncreated')) out.metrics.marketing.campaigns += 1;
    if (name.includes('couponclaimed')) {
      out.metrics.marketing.couponsClaimed += 1;
      const claimer = e.args?.claimer || e.args?.user || e.args?.[0];
      if (claimer) claimers.add((claimer + '').toLowerCase());
    }
    if (name.includes('viralshare')) out.metrics.marketing.viralShares += 1;
  }
  out.metrics.marketing.uniqueClaimers = claimers.size;

  // Business
  for (const e of factory) {
    const name = e.name.toLowerCase();
    if (name.includes('businessregistered')) out.metrics.business.businessesRegistered += 1;
  }

  // Trust
  for (const e of trust) {
    const name = e.name.toLowerCase();
    if (name.includes('userregistered')) out.metrics.trust.usersRegistered += 1;
    if (name.includes('trustscoreupdated')) out.metrics.trust.trustUpdates += 1;
  }

  // Sample a few recent events per contract for debugging/traceability
  for (const [k, arr] of Object.entries(eventBuckets)) {
    out.samples[k] = arr.slice(-5);
  }

  const outDir = path.join(__dirname, '..', 'analytics');
  await ensureDir(outDir);
  const outFile = path.join(outDir, `metrics-kairos.json`);
  await fs.promises.writeFile(outFile, JSON.stringify(out, null, 2));

  // Also publish to public/analytics for the frontend to fetch
  const publicDir = path.join(__dirname, '..', 'public', 'analytics');
  await ensureDir(publicDir);
  const publicFile = path.join(publicDir, 'metrics-kairos.json');
  await fs.promises.writeFile(publicFile, JSON.stringify(out, null, 2));

  console.log('✅ Metrics written to:', outFile);
  console.log('✅ Public metrics written to:', publicFile);
  console.log('Summary:', JSON.stringify(out.metrics, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});