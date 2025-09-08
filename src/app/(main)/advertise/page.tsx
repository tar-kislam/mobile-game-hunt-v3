'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Megaphone, CheckCircle, Clock, Users, Star, Target, Calendar, DollarSign, Palette } from 'lucide-react';
import Stepper, { Step } from '@/components/ui/stepper';

const multiStepSchema = z.object({
  // Step 1: Advertising Goal
  advertisingGoal: z.string().min(1, 'Please select an advertising goal'),
  
  // Step 2: Conditional fields based on goal
  launchDate: z.string().optional(),
  targetCountries: z.string().optional(),
  discordHandle: z.string().optional(),
  redditHandle: z.string().optional(),
  
  // Step 3: Budget
  budgetRange: z.string().min(1, 'Please select a budget range'),
  
  // Step 4: Creative Support
  creativeSupport: z.string().min(1, 'Please select if you need creative support'),
  
  // Step 5: Contact Info
  title: z.string().min(1, 'Game title is required').max(100, 'Title must be less than 100 characters'),
  gameUrl: z.string().url('Please enter a valid URL'),
  developer: z.string().min(1, 'Developer name is required').max(100, 'Developer name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  notes: z.string().optional(),
});

type MultiStepFormData = z.infer<typeof multiStepSchema>;

export default function AdvertisePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<MultiStepFormData>>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<MultiStepFormData>({
    resolver: zodResolver(multiStepSchema),
    mode: 'onChange',
  });

  const watchedValues = watch();

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const getFieldsForStep = (step: number): (keyof MultiStepFormData)[] => {
    switch (step) {
      case 1:
        return ['advertisingGoal'];
      case 2:
        if (formData.advertisingGoal === 'game-launch') {
          return ['launchDate', 'targetCountries'];
        } else if (formData.advertisingGoal === 'community-growth') {
          return ['discordHandle', 'redditHandle'];
        }
        return [];
      case 3:
        return ['budgetRange'];
      case 4:
        return ['creativeSupport'];
      case 5:
        return ['title', 'gameUrl', 'developer', 'email'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: MultiStepFormData) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/sponsorship', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          slot: 'multi-step-request',
          notes: `Multi-step form submission:\nGoal: ${data.advertisingGoal}\nBudget: ${data.budgetRange}\nCreative Support: ${data.creativeSupport}\nAdditional Notes: ${data.notes || 'None'}`,
        }),
      });

      if (response.ok) {
        toast.success('Your advertising request has been submitted. We\'ll contact you soon!');
        reset();
        setFormData({});
        setCurrentStep(1);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting sponsorship request:', error);
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalStepCompleted = () => {
    handleSubmit(onSubmit)();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Intro Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Megaphone className="w-10 h-10 text-purple-400" />
            Advertise on Mobile Game Hunt
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Let's create a personalized advertising strategy for your game in just a few steps.
          </p>
        </div>

        {/* Multi-Step Form */}
        <Card className="max-w-4xl mx-auto bg-gray-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Personalized Advertising Strategy</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Answer a few questions to get a customized advertising plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Stepper
              initialStep={1}
              onStepChange={handleStepChange}
              onFinalStepCompleted={handleFinalStepCompleted}
              backButtonText="Previous"
              nextButtonText="Next"
              stepCircleContainerClassName="bg-gray-700/50"
              contentClassName="min-h-[400px]"
              backButtonProps={{
                className: "bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
              }}
              nextButtonProps={{
                className: "bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              }}
            >
              {/* Step 1: Advertising Goal */}
              <Step>
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <Target className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">What's your advertising goal?</h2>
                  <p className="text-gray-400">This helps us tailor the perfect strategy for you</p>
                  
                  <div className="space-y-4">
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.advertisingGoal === 'brand-awareness' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('advertisingGoal', 'brand-awareness')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.advertisingGoal === 'brand-awareness' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.advertisingGoal === 'brand-awareness' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Brand Awareness</div>
                        <div className="text-sm text-gray-400">Increase visibility and recognition</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.advertisingGoal === 'game-launch' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('advertisingGoal', 'game-launch')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.advertisingGoal === 'game-launch' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.advertisingGoal === 'game-launch' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Game Launch</div>
                        <div className="text-sm text-gray-400">Promote a new game release</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.advertisingGoal === 'community-growth' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('advertisingGoal', 'community-growth')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.advertisingGoal === 'community-growth' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.advertisingGoal === 'community-growth' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Community Growth</div>
                        <div className="text-sm text-gray-400">Build and engage your player base</div>
                      </div>
                    </div>
                  </div>
                  
                  {errors.advertisingGoal && (
                    <p className="text-red-400 text-sm">{errors.advertisingGoal.message}</p>
                  )}
                </div>
              </Step>

              {/* Step 2: Conditional Questions */}
              <Step>
                <div className="text-center space-y-6">
                  {formData.advertisingGoal === 'game-launch' && (
                    <>
                      <div className="flex justify-center">
                        <Calendar className="w-12 h-12 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Game Launch Details</h2>
                      <p className="text-gray-400">Tell us about your upcoming launch</p>
                      
                      <div className="space-y-4">
                        <div className="text-left">
                          <Label htmlFor="launchDate" className="text-white">Planned Launch Date</Label>
                          <Input
                            id="launchDate"
                            type="date"
                            {...register('launchDate')}
                            className="bg-gray-700 border-gray-600 text-white focus:border-purple-500 mt-2"
                          />
                          {errors.launchDate && (
                            <p className="text-red-400 text-sm mt-1">{errors.launchDate.message}</p>
                          )}
                        </div>
                        
                        <div className="text-left">
                          <Label htmlFor="targetCountries" className="text-white">Target Countries</Label>
                          <Input
                            id="targetCountries"
                            {...register('targetCountries')}
                            placeholder="e.g., US, UK, Germany, Japan"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                          />
                          {errors.targetCountries && (
                            <p className="text-red-400 text-sm mt-1">{errors.targetCountries.message}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {formData.advertisingGoal === 'community-growth' && (
                    <>
                      <div className="flex justify-center">
                        <Users className="w-12 h-12 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Community Platforms</h2>
                      <p className="text-gray-400">Where is your community most active?</p>
                      
                      <div className="space-y-4">
                        <div className="text-left">
                          <Label htmlFor="discordHandle" className="text-white">Discord Server</Label>
                          <Input
                            id="discordHandle"
                            {...register('discordHandle')}
                            placeholder="e.g., @yourdiscordserver"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                          />
                          {errors.discordHandle && (
                            <p className="text-red-400 text-sm mt-1">{errors.discordHandle.message}</p>
                          )}
                        </div>
                        
                        <div className="text-left">
                          <Label htmlFor="redditHandle" className="text-white">Reddit Community</Label>
                          <Input
                            id="redditHandle"
                            {...register('redditHandle')}
                            placeholder="e.g., r/yourgame"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                          />
                          {errors.redditHandle && (
                            <p className="text-red-400 text-sm mt-1">{errors.redditHandle.message}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {formData.advertisingGoal === 'brand-awareness' && (
                    <>
                      <div className="flex justify-center">
                        <Star className="w-12 h-12 text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Brand Awareness</h2>
                      <p className="text-gray-400">Great choice! We'll focus on increasing your game's visibility across our platform.</p>
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                        <p className="text-purple-200 text-sm">
                          Our team will create a comprehensive brand awareness campaign including featured placements, 
                          social media promotion, and community engagement strategies.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Step>

              {/* Step 3: Budget Range */}
              <Step>
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <DollarSign className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">What's your budget range?</h2>
                  <p className="text-gray-400">This helps us recommend the best advertising packages</p>
                  
                  <div className="space-y-4">
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.budgetRange === 'small' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('budgetRange', 'small')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.budgetRange === 'small' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.budgetRange === 'small' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Small ($500 - $2,000)</div>
                        <div className="text-sm text-gray-400">Perfect for indie developers</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.budgetRange === 'medium' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('budgetRange', 'medium')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.budgetRange === 'medium' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.budgetRange === 'medium' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Medium ($2,000 - $10,000)</div>
                        <div className="text-sm text-gray-400">Great for established studios</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.budgetRange === 'large' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('budgetRange', 'large')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.budgetRange === 'large' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.budgetRange === 'large' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Large ($10,000+)</div>
                        <div className="text-sm text-gray-400">Premium campaigns for major releases</div>
                      </div>
                    </div>
                  </div>
                  
                  {errors.budgetRange && (
                    <p className="text-red-400 text-sm">{errors.budgetRange.message}</p>
                  )}
                </div>
              </Step>

              {/* Step 4: Creative Support */}
              <Step>
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <Palette className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Do you need creative support?</h2>
                  <p className="text-gray-400">We can help create graphics, videos, and promotional materials</p>
                  
                  <div className="space-y-4">
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.creativeSupport === 'yes' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('creativeSupport', 'yes')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.creativeSupport === 'yes' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.creativeSupport === 'yes' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">Yes, I need creative support</div>
                        <div className="text-sm text-gray-400">Graphics, videos, banners, and promotional materials</div>
                      </div>
                    </div>
                    
                    <div 
                      className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                        watchedValues.creativeSupport === 'no' 
                          ? 'bg-purple-500/20 border-purple-500' 
                          : 'bg-gray-700/50 border-gray-600 hover:border-purple-500'
                      }`}
                      onClick={() => setValue('creativeSupport', 'no')}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        watchedValues.creativeSupport === 'no' 
                          ? 'border-purple-500 bg-purple-500' 
                          : 'border-gray-400'
                      }`}>
                        {watchedValues.creativeSupport === 'no' && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">No, I have my own creative assets</div>
                        <div className="text-sm text-gray-400">I'll provide all promotional materials</div>
                      </div>
                    </div>
                  </div>
                  
                  {errors.creativeSupport && (
                    <p className="text-red-400 text-sm">{errors.creativeSupport.message}</p>
                  )}
                </div>
              </Step>

              {/* Step 5: Contact Information */}
              <Step>
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <CheckCircle className="w-12 h-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Almost done!</h2>
                  <p className="text-gray-400">Just a few more details to complete your request</p>
                  
                  <div className="space-y-4 text-left">
                    <div>
                      <Label htmlFor="title" className="text-white">Game Title *</Label>
                      <Input
                        id="title"
                        {...register('title')}
                        placeholder="Enter your game title"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                      />
                      {errors.title && (
                        <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="gameUrl" className="text-white">Game URL *</Label>
                      <Input
                        id="gameUrl"
                        {...register('gameUrl')}
                        placeholder="https://yourgame.com"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                      />
                      {errors.gameUrl && (
                        <p className="text-red-400 text-sm mt-1">{errors.gameUrl.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="developer" className="text-white">Developer Name / Studio *</Label>
                      <Input
                        id="developer"
                        {...register('developer')}
                        placeholder="Your studio or developer name"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                      />
                      {errors.developer && (
                        <p className="text-red-400 text-sm mt-1">{errors.developer.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">Contact Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        placeholder="your@email.com"
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 mt-2"
                      />
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-white">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        placeholder="Any additional information or special requirements..."
                        rows={3}
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 resize-none mt-2"
                      />
                    </div>
                  </div>
                </div>
              </Step>
            </Stepper>
          </CardContent>
        </Card>

        {/* Summary Section */}
        <Card className="mt-8 max-w-2xl mx-auto bg-gray-800/50 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">Review Process:</strong> Our team will review your submission within 48 hours. 
                We evaluate games based on quality, originality, and alignment with our community values.
              </p>
              <p>
                <strong className="text-white">Approval:</strong> If approved, we'll contact you via email with pricing details 
                and available scheduling options for your chosen advertising slot.
              </p>
              <p>
                <strong className="text-white">Payment:</strong> Once pricing is agreed upon, we'll provide secure payment 
                options and finalize the advertising schedule.
              </p>
              <p>
                <strong className="text-white">Launch:</strong> Your game will be featured according to the agreed schedule, 
                reaching thousands of mobile gamers in our community.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}