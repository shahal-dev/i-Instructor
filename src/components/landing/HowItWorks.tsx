import React from 'react';
import { Search, UserCheck, MessageCircle, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Describe Your Problem',
    description: 'Select your subject and briefly describe what you need help with.',
    color: 'text-blue-600'
  },
  {
    icon: UserCheck,
    title: 'Get Matched Instantly',
    description: 'Our system finds the best available instructor based on your needs.',
    color: 'text-green-600'
  },
  {
    icon: MessageCircle,
    title: 'Start Learning',
    description: 'Connect via chat, audio, or video with shared whiteboard and tools.',
    color: 'text-purple-600'
  },
  {
    icon: CheckCircle,
    title: 'Problem Solved',
    description: 'Rate your session and save the solution for future reference.',
    color: 'text-orange-600'
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How i-Instructor Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get instant academic help in just 4 simple steps. From problem to solution in minutes.
          </p>
        </div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-16 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 via-purple-200 to-orange-200"></div>
          
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white border-4 border-gray-100 rounded-full mb-6 relative z-10">
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                
                {/* Content */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Step indicator */}
                <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 ${step.color.replace('text', 'bg')} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Example session preview */}
        <div className="mt-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              See It In Action
            </h3>
            <p className="text-gray-600">
              A typical i-Instructor session walkthrough
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">Live Session - Calculus Help</span>
                  <span className="text-blue-200 text-sm ml-auto">05:23</span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">A</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                      "I'm having trouble with this integral: ∫x²e^x dx. Can you show me how to use integration by parts?"
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">T</span>
                  </div>
                  <div className="flex-1">
                    <div className="bg-green-50 border-l-4 border-green-400 p-3">
                      <div className="text-gray-800 mb-2">
                        "Great question! For ∫x²e^x dx, we'll use integration by parts twice. Let me show you step by step..."
                      </div>
                      <div className="text-sm text-green-700 font-medium">
                        ✓ Shared whiteboard opened
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;