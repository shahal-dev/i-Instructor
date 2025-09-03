import React from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Pay As You Go',
    description: 'Perfect for occasional help',
    price: '1-5',
    unit: 'per 15min session',
    features: [
      'Instant instructor matching',
      'Text, audio & video chat',
      'Shared whiteboard',
      'Session recordings',
      'Basic support'
    ],
    icon: Zap,
    buttonText: 'Start Learning',
    buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  {
    name: 'Student Monthly',
    description: 'Best value for regular learners',
    price: '15',
    unit: 'per month',
    originalPrice: '25',
    features: [
      '10 free 15-minute sessions',
      '40% discount on additional sessions',
      'Priority instructor matching',
      'Advanced analytics',
      'Homework help queue',
      'Study schedule planner',
      'Premium support'
    ],
    icon: Star,
    buttonText: 'Get Started',
    buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white',
    popular: true
  },
  {
    name: 'Instructor Pro',
    description: 'For serious tutors & educators',
    price: '29',
    unit: 'per month',
    features: [
      'Lower platform fees (10% vs 20%)',
      'Advanced scheduling tools',
      'Student progress tracking',
      'Custom pricing options',
      'Marketing boost',
      'Priority support',
      'Analytics dashboard'
    ],
    icon: Crown,
    buttonText: 'Become Pro',
    buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white'
  }
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Affordable Learning for Everyone
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transparent pricing with no hidden fees. Pay only for the help you need, 
            when you need it.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl border-2 p-8 relative transition-all hover:shadow-lg ${
                plan.popular 
                  ? 'border-orange-300 shadow-lg scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <plan.icon className="w-8 h-8 text-gray-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-lg text-gray-400 line-through mr-2">
                      ${plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-1">
                    {plan.unit}
                  </span>
                </div>
                
                {plan.originalPrice && (
                  <div className="text-sm text-orange-600 font-medium">
                    Save ${parseInt(plan.originalPrice) - parseInt(plan.price)} per month!
                  </div>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.buttonClass}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-blue-50 rounded-xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Special Launch Offer for Bangladesh Students
            </h3>
            <p className="text-gray-700 mb-6">
              Get your first 3 sessions completely free when you sign up this month. 
              Plus, pay with bKash, Nagad, or Rocket for added convenience.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
                <span className="text-sm text-gray-600">Accepted:</span>
                <span className="font-semibold text-gray-900 ml-2">
                  bKash • Nagad • Rocket • Cards
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;