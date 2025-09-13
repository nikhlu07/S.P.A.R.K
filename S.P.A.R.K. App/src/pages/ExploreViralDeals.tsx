import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const mockDeals = [
  {
    id: '1',
    title: '50% Off All Pizzas',
    description: 'Enjoy a flat 50% discount on all pizza varieties. Limited time offer!',
    store: 'Pizza Place',
    image: 'https://via.placeholder.com/350/FF5733/FFFFFF?text=Pizza',
    discount: '50%',
    category: 'Food',
    endDate: '2024-12-31',
  },
  {
    id: '2',
    title: 'BOGO on Coffee',
    description: 'Buy any coffee and get another one absolutely free. Perfect for sharing!',
    store: 'Coffee Corner',
    image: 'https://via.placeholder.com/350/C70039/FFFFFF?text=Coffee',
    discount: 'BOGO',
    category: 'Beverages',
    endDate: '2024-11-30',
  },
  {
    id: '3',
    title: '20% Off Electronics',
    description: 'Get a 20% discount on a wide range of electronics. Upgrade your gadgets now!',
    store: 'Tech World',
    image: 'https://via.placeholder.com/350/900C3F/FFFFFF?text=Tech',
    discount: '20%',
    category: 'Electronics',
    endDate: '2024-12-15',
  },
  {
    id: '4',
    title: '30% Off Fashion',
    description: 'Update your wardrobe with the latest trends and get 30% off.',
    store: 'Style Hub',
    image: 'https://via.placeholder.com/350/581845/FFFFFF?text=Fashion',
    discount: '30%',
    category: 'Apparel',
    endDate: '2024-11-25',
  },
  {
    id: '5',
    title: 'Free Dessert with Meal',
    description: 'Enjoy a complimentary dessert with every main course ordered.',
    store: 'Gourmet Garden',
    image: 'https://via.placeholder.com/350/DAF7A6/000000?text=Dessert',
    discount: 'Free',
    category: 'Food',
    endDate: '2024-12-01',
  },
  {
    id: '6',
    title: '15% Off Books',
    description: 'Expand your library with a 15% discount on all books.',
    store: 'Readers Nook',
    image: 'https://via.placeholder.com/350/FFC300/000000?text=Books',
    discount: '15%',
    category: 'Books',
    endDate: '2024-12-10',
  },
];

const ExploreViralDeals = () => {
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setDeals(mockDeals);
  }, []);

  return (
    <>
      <h1 className="font-tech text-3xl font-bold text-white text-glow mb-8 text-center">
        Explore Viral Deals
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden flex flex-col bg-gray-900/50 card-border-glow animation-none">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-glow">{deal.title}</CardTitle>
                  <CardDescription className="text-purple-400">{deal.store}</CardDescription>
                </div>
                <div className="font-tech text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 rounded-full px-3 py-1">
                  {deal.category}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <img src={deal.image} alt={deal.title} className="rounded-lg mb-4 w-full h-48 object-cover" />
              <p className="text-gray-300">{deal.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="text-sm text-gray-400 font-tech">
                Expires: {new Date(deal.endDate).toLocaleDateString()}
              </div>
              <Link to={`/deal/${deal.id}`}>
                <Button variant="cyber">View Deal</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};

export default ExploreViralDeals;
