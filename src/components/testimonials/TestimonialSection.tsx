import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: '1',
    name: 'Ahmad Rahman',
    university: 'University of Dhaka',
    department: 'Computer Science',
    year: '3rd Year',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'i-Instructor saved my semester! I was struggling with data structures and got help within 2 minutes. The instructor was patient and explained everything clearly.',
    subject: 'Computer Science',
    helpedWith: 'Binary Search Trees'
  },
  {
    id: '2',
    name: 'Fatima Khan',
    university: 'BUET',
    department: 'Electrical Engineering',
    year: '2nd Year',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'The calculus help I received was incredible. The instructor used the whiteboard to show step-by-step solutions. Much better than watching YouTube videos!',
    subject: 'Mathematics',
    helpedWith: 'Integration by Parts'
  },
  {
    id: '3',
    name: 'Rashid Ahmed',
    university: 'NSU',
    department: 'Business Administration',
    year: '1st Year',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'As a first-year student, I was overwhelmed with statistics. The peer tutoring here is amazing - students helping students in their own language and style.',
    subject: 'Statistics',
    helpedWith: 'Probability Distributions'
  },
  {
    id: '4',
    name: 'Nusrat Jahan',
    university: 'Jahangirnagar University',
    department: 'Chemistry',
    year: '4th Year',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'The organic chemistry sessions helped me understand reaction mechanisms that I couldn\'t grasp in lectures. The instructors are genuinely passionate about teaching.',
    subject: 'Chemistry',
    helpedWith: 'Organic Reactions'
  },
  {
    id: '5',
    name: 'Karim Hassan',
    university: 'IUT',
    department: 'Mechanical Engineering',
    year: '3rd Year',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'Perfect for last-minute help before exams. I got physics help at 11 PM and the instructor was still energetic and helpful. Truly 24/7 support!',
    subject: 'Physics',
    helpedWith: 'Thermodynamics'
  },
  {
    id: '6',
    name: 'Sadia Islam',
    university: 'BRAC University',
    department: 'English Literature',
    year: '2nd Year',
    avatar: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'The essay writing help transformed my academic writing. The instructor provided detailed feedback and helped me develop my own voice. Highly recommended!',
    subject: 'English',
    helpedWith: 'Essay Writing'
  }
];

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Students Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real stories from students who found academic success through i-Instructor's 
            peer-to-peer learning platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="w-8 h-8 text-blue-200" />
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Help Context */}
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Got help with:</span> {testimonial.helpedWith}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Subject: {testimonial.subject}
                </div>
              </div>

              {/* Student Info */}
              <div className="flex items-center space-x-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">
                    {testimonial.year}, {testimonial.department}
                  </div>
                  <div className="text-xs text-gray-500">{testimonial.university}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">2,847</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">12,543</div>
              <div className="text-gray-600">Sessions Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">2 min</div>
              <div className="text-gray-600">Average Wait Time</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Join Thousands of Successful Students
          </h3>
          <p className="text-gray-600 mb-6">
            Start your academic success story today with instant expert help.
          </p>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
            Get Help Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;