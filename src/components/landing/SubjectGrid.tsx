import React from 'react';
import { Calculator, Code, Atom, TestTube, Dna, BookOpen, Globe, TrendingUp } from 'lucide-react';

const subjects = [
  {
    name: 'Mathematics',
    icon: Calculator,
    topics: ['Calculus', 'Linear Algebra', 'Statistics', 'Discrete Math'],
    instructors: 156,
    avgPrice: 3,
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    name: 'Computer Science',
    icon: Code,
    topics: ['Programming', 'Data Structures', 'Algorithms', 'Web Dev'],
    instructors: 234,
    avgPrice: 4,
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    name: 'Physics',
    icon: Atom,
    topics: ['Mechanics', 'Thermodynamics', 'Quantum', 'Electromagnetism'],
    instructors: 89,
    avgPrice: 3,
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    name: 'Chemistry',
    icon: TestTube,
    topics: ['Organic', 'Inorganic', 'Physical', 'Analytical'],
    instructors: 76,
    avgPrice: 3,
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  {
    name: 'Biology',
    icon: Dna,
    topics: ['Molecular', 'Genetics', 'Ecology', 'Biochemistry'],
    instructors: 67,
    avgPrice: 3,
    color: 'bg-teal-50 border-teal-200 text-teal-700'
  },
  {
    name: 'English',
    icon: BookOpen,
    topics: ['Writing', 'Literature', 'Grammar', 'Essays'],
    instructors: 143,
    avgPrice: 2,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  },
  {
    name: 'Economics',
    icon: TrendingUp,
    topics: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Finance'],
    instructors: 54,
    avgPrice: 3,
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  },
  {
    name: 'Languages',
    icon: Globe,
    topics: ['Bengali', 'Arabic', 'Hindi', 'French'],
    instructors: 92,
    avgPrice: 2,
    color: 'bg-rose-50 border-rose-200 text-rose-700'
  }
];

const SubjectGrid: React.FC = () => {
  return (
    <section id="subjects" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Expert Help in Every Subject
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with qualified instructors across all major academic disciplines. 
            From STEM subjects to languages and humanities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <div
              key={index}
              className={`${subject.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white rounded-lg mr-3">
                  <subject.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold">{subject.name}</h3>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {subject.topics.map((topic, topicIndex) => (
                    <span
                      key={topicIndex}
                      className="text-xs bg-white bg-opacity-70 px-2 py-1 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-medium">
                  <span>{subject.instructors} instructors</span>
                  <span>${subject.avgPrice}/15min</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white border-opacity-30">
                <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                  Get Help Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Don't see your subject? We're constantly adding new areas of expertise.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Request a Subject
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubjectGrid;