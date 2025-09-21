import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Share2, Users, Gift, Copy, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lineService } from '@/services/lineService';

interface Friend {
    id: string;
    name: string;
    avatar?: string;
    status: 'invited' | 'joined' | 'active';
    tokensEarned: number;
    joinedDate?: string;
}

function FriendInvitation() {
    const { toast } = useToast();
    const [friends, setFriends] = useState<Friend[]>([
        {
            id: '1',
            name: 'Priya Sharma',
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50',
            status: 'joined',
            tokensEarned: 150,
            joinedDate: '2024-01-15'
        },
        {
            id: '2',
            name: 'Rahul Kumar',
            status: 'invited',
            tokensEarned: 0
        }
    ]);

    const [inviteCode] = useState('SPARK-' + Math.random().toString(36).substr(2, 8).toUpperCase());
    const [totalEarned] = useState(450);

    const handleInviteFriends = async () => {
        try {
            const success = await lineService.inviteFriends();
            if (success) {
                toast({
                    title: "Invitation Sent!",
                    description: "Your friends will receive an invitation to join S.P.A.R.K.",
                });
            }
        } catch (error) {
            toast({
                title: "Share Failed",
                description: "Could not share invitation. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleCopyInviteCode = async () => {
        try {
            const inviteUrl = `${window.location.origin}?invite=${inviteCode}`;
            await navigator.clipboard.writeText(inviteUrl);
            toast({
                title: "Invite Link Copied!",
                description: "Share this link with your friends to earn rewards.",
            });
        } catch (error) {
            toast({
                title: "Copy Failed",
                description: "Could not copy invite link.",
                variant: "destructive"
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'joined': return 'bg-green-500/20 text-green-400';
            case 'active': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-yellow-500/20 text-yellow-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Invitation Stats */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <Users className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{friends.length}</p>
                        <p className="text-sm text-gray-400">Friends Invited</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{totalEarned}</p>
                        <p className="text-sm text-gray-400">Tokens Earned</p>
                    </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                    <CardContent className="p-4 text-center">
                        <Share2 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-white">{friends.filter(f => f.status === 'joined').length}</p>
                        <p className="text-sm text-gray-400">Successfully Joined</p>
                    </CardContent>
                </Card>
            </div>

            {/* Invite Actions */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Invite Friends & Earn Rewards
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Your Invite Code</h4>
                        <div className="flex items-center gap-2">
                            <Input
                                value={inviteCode}
                                readOnly
                                className="bg-gray-700/50 border-gray-600 text-white font-mono"
                            />
                            <Button
                                onClick={handleCopyInviteCode}
                                variant="outline"
                                size="sm"
                                className="text-white border-gray-600"
                            >
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={handleInviteFriends}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Share on LINE
                        </Button>
                        <Button
                            onClick={handleCopyInviteCode}
                            variant="outline"
                            className="text-white border-gray-600"
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                        </Button>
                    </div>

                    <div className="text-sm text-gray-400">
                        <p>🎁 <strong>Earn 50 tokens</strong> for each friend who joins</p>
                        <p>💰 <strong>Get 10% bonus</strong> on their first purchase</p>
                        <p>🚀 <strong>Unlock exclusive deals</strong> when you invite 5+ friends</p>
                    </div>
                </CardContent>
            </Card>

            {/* Friends List */}
            <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                    <CardTitle className="text-white">Your Invited Friends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {friends.map((friend) => (
                            <div
                                key={friend.id}
                                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {friend.avatar ? (
                                        <img
                                            src={friend.avatar}
                                            alt={friend.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-medium">{friend.name}</p>
                                        {friend.joinedDate && (
                                            <p className="text-xs text-gray-400">
                                                Joined {new Date(friend.joinedDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Badge className={getStatusColor(friend.status)}>
                                        {friend.status}
                                    </Badge>
                                    {friend.tokensEarned > 0 && (
                                        <span className="text-sm text-green-400">
                                            +{friend.tokensEarned} tokens
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {friends.length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No friends invited yet</p>
                                <p className="text-sm">Start inviting friends to earn rewards!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
export { FriendInvitation };
