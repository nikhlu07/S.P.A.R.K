import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BusinessVerificationPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-auto max-w-lg bg-black/30 backdrop-blur-md border border-gray-800/50">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Business Verification</CardTitle>
          <CardDescription className="text-gray-400">
            Upload the required documents to verify your business account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="company-name" className="text-gray-400">Company Name</Label>
              <Input id="company-name" defaultValue="Acme Inc." readOnly className="bg-gray-900/50 border-gray-800 text-white" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="incorporation-certificate" className="text-gray-400">Incorporation Certificate</Label>
              <Input id="incorporation-certificate" type="file" className="bg-gray-900/50 border-gray-800 text-white file:text-white file:bg-purple-600/50 file:border-0 file:hover:bg-purple-700/50" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="other-documents" className="text-gray-400">Additional Documents</Label>
              <Input id="other-documents" type="file" multiple className="bg-gray-900/50 border-gray-800 text-white file:text-white file:bg-purple-600/50 file:border-0 file:hover:bg-purple-700/50" />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Submit for Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessVerificationPage;
