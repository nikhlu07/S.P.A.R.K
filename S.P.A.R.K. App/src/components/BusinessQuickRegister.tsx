import React, { useState } from 'react';
import { useBusiness } from '@/contexts/BusinessContext';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CheckCircle, AlertCircle } from 'lucide-react';

export const BusinessQuickRegister: React.FC = () => {
  const { registerBusiness, isLoading } = useBusiness();
  const { account, isConnected } = useWeb3();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    category: '',
    description: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const businessData = {
        ...formData,
        wallet_address: account,
        is_verified: false
      };

      const success = await registerBusiness(businessData);
      
      if (success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          category: '',
          description: '',
          image: ''
        });
      } else {
        setError('Failed to register business. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Business Registered Successfully!</h3>
          <p className="text-gray-300 mb-4">
            Your business has been registered. You can now create deals and start reaching customers.
          </p>
          <Button 
            onClick={() => setSuccess(false)}
            variant="outline"
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            Register Another Business
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Quick Business Registration</span>
        </CardTitle>
        <CardDescription className="text-gray-300">
          Register your business to start creating deals and reaching customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">
                Please connect your wallet to register your business
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-white">Business Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter business name"
                required
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="business@example.com"
                required
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="text-white">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-gray-700/50 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-white">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-white">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="123 Main St, City, State 12345"
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Tell us about your business..."
              rows={3}
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-white">Business Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/business-image.jpg"
              className="bg-gray-700/50 border-gray-600 text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={!isConnected || isSubmitting || isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? 'Registering...' : 'Register Business'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
