import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mockNotifications = [
  {
    id: '1',
    title: 'New Deal Alert!',
    description: 'Pizza Place is offering 50% off all pizzas. Claim it now!',
    time: '15m ago',
  },
  {
    id: '2',
    title: 'Reward Token Received',
    description: 'You received 10 RWD tokens for supporting Coffee Corner.',
    time: '1h ago',
  },
  {
    id: '3',
    title: 'Community Milestone',
    description: 'The community has collectively saved over ₹1,00,000!',
    time: '3h ago',
  },
];

const Notifications = () => {
  return (
    <>
      <h1 className="font-tech text-3xl font-bold text-white text-glow mb-8 text-center">
        Notifications
      </h1>
      <div className="space-y-4">
        {mockNotifications.map((notification) => (
          <Card key={notification.id} className="bg-gray-900/50 card-border-glow animation-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-bold text-white text-glow">{notification.title}</CardTitle>
              <div className="text-xs text-gray-400 font-tech">{notification.time}</div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{notification.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default Notifications;
