'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';

interface Answers {
  [key: string]: string;
}

export default function Home() {
  const [answers, setAnswers] = useState<Answers>({});
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [salary, setSalary] = useState('');
  const [savings, setSavings] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('lifeHappinessIndex');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed.answers || {});
      setHeight(parsed.height || '');
      setWeight(parsed.weight || '');
      setSalary(parsed.salary || '');
      setSavings(parsed.savings || '');
    }
  }, []);

  // Save to localStorage whenever answers change
  useEffect(() => {
    localStorage.setItem('lifeHappinessIndex', JSON.stringify({ answers, height, weight, salary, savings }));
  }, [answers, height, weight, salary, savings]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateBMI = () => {
    if (!height || !weight) return null;
    const heightM = parseFloat(height) / 100; // assuming cm
    const weightKg = parseFloat(weight);
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(1);
  };

  const calculateSavingsPercentage = () => {
    if (!salary || !savings) return null;
    const salaryNum = parseFloat(salary);
    const savingsNum = parseFloat(savings);
    if (salaryNum === 0) return null;
    const percentage = (savingsNum / salaryNum) * 100;
    return percentage.toFixed(1);
  };

  const renderSliderQuestion = (
    questionId: string,
    title: string,
    minLabel: string,
    midLabel: string,
    maxLabel: string
  ) => {
    const value = answers[questionId] ? parseInt(answers[questionId]) : 4;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{title}</Label>
          <span className="text-sm font-semibold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full">
            {value + 1}/10
          </span>
        </div>
        <div className="space-y-2 pt-2">
          <Slider
            value={[value]}
            onValueChange={(vals) => handleAnswerChange(questionId, vals[0].toString())}
            min={0}
            max={9}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-400 px-1">
            <span className="text-left max-w-[30%]">{minLabel}</span>
            <span className="text-center">{midLabel}</span>
            <span className="text-right max-w-[30%]">{maxLabel}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Life Happiness Index
            </CardTitle>
            <CardDescription className="text-base mt-3 leading-relaxed">
              This metric predicts how likely you are to be happy—defined as genuinely wanting to exist. 
              Answer each question from a long-term perspective, not just this week. 
              <span className="block mt-2 font-medium text-slate-300">
                🔒 All data is saved locally in your browser. Nothing is sent externally.
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 1. Career & Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">1. Career & Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '1a',
              '1a. Annual salary compared to people your age?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '1b',
              '1b. Hours working per week compared to average?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '1c',
              '1c. Net worth compared to people your age?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '1d',
              '1d. How comfortable is your job?',
              'Very uncomfortable',
              'Average',
              'Very comfortable'
            )}
          </CardContent>
        </Card>

        {/* 2. Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">2. Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '2a',
              '2a. How many times per week do you exercise?',
              '0 times',
              '3-4 times',
              '7+ times'
            )}
            {renderSliderQuestion(
              '2b',
              '2b. How intense is your exercise on average?',
              'None',
              'Moderate',
              'Athlete-level'
            )}
          </CardContent>
        </Card>

        {/* 3. Social Life */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">3. Social Life</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '3a',
              '3a. How many hours per day do you interact with friends?',
              '0 hours',
              '2-3 hours',
              '5+ hours'
            )}
            {renderSliderQuestion(
              '3b',
              '3b. How many close friends do you have?',
              '0-1 friends',
              '5-8 friends',
              '16+ friends'
            )}
            {renderSliderQuestion(
              '3c',
              '3c. Length of your longest active friendship (years)?',
              'Less than 1',
              '10 years',
              '20+ years'
            )}
          </CardContent>
        </Card>

        {/* 4. Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">4. Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">4a. Monthly financial information</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salary" className="text-sm">Monthly salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="50000"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="savings" className="text-sm">Monthly savings</Label>
                  <Input
                    id="savings"
                    type="number"
                    placeholder="10000"
                    value={savings}
                    onChange={(e) => setSavings(e.target.value)}
                  />
                </div>
              </div>
              {calculateSavingsPercentage() && (
                <p className="text-sm text-slate-400">
                  Savings rate: <span className="font-semibold">{calculateSavingsPercentage()}%</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 5. Physical Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">5. Physical Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '5a',
              '5a. How many alcoholic drinks per week?',
              '0 drinks',
              '7-8 drinks',
              '15+ drinks'
            )}
            {renderSliderQuestion(
              '5b',
              '5b. How many times per week do you use nicotine/tobacco?',
              'Never',
              '3-4 times',
              'Daily (7+)'
            )}
            
            {/* BMI Calculator */}
            <div className="space-y-3">
              <Label className="text-base font-medium">5c. Height and weight</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
        </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
              {calculateBMI() && (
                <p className="text-sm text-slate-600">
                  BMI: <span className="font-semibold">{calculateBMI()}</span>
                </p>
              )}
            </div>

            {renderSliderQuestion(
              '5d',
              '5d. Dental hygiene routine?',
              'Never',
              'Brush once daily',
              'Brush & floss 2x daily'
            )}
            {renderSliderQuestion(
              '5e',
              '5e. How many times per week do you use recreational drugs?',
              'Never',
              '3-4 times',
              'Daily (7+)'
            )}
            {renderSliderQuestion(
              '5f',
              '5f. Chronic health conditions (e.g., back pain, migraines, arthritis)?',
              'None',
              'Manageable',
              'Terminal/severe'
            )}
          </CardContent>
        </Card>

        {/* 6. Education & Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">6. Education & Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '6a',
              '6a. Education level compared to people your age?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '6b',
              '6b. How healthy do you eat overall?',
              'Very unhealthy',
              'Average',
              'Very healthy'
            )}
          </CardContent>
        </Card>

        {/* 7. Hobbies & Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">7. Hobbies & Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '7a',
              '7a. Number of hobbies compared to average?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '7b',
              '7b. Skill level in hobbies compared to average person?',
              'Beginner',
              'Average',
              'Expert'
            )}
          </CardContent>
        </Card>

        {/* 8. Sleep */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">8. Sleep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '8a',
              '8a. Sleep hours compared to recommended average?',
              'Well below',
              'Average',
              'Optimal'
            )}
          </CardContent>
        </Card>

        {/* 9. Romantic Relationship */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">9. Romantic Relationship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '9a',
              '9a. How many years in your current relationship?',
              'None (single)',
              '3-4 years',
              '8+ years'
            )}
          </CardContent>
        </Card>

        {/* 10. Family Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">10. Family Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '10a',
              '10a. How good are your family relationships?',
              'Very poor',
              'Average',
              'Very good'
            )}
          </CardContent>
        </Card>

        {/* 11. Daily Structure & Outdoor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">11. Daily Structure & Outdoor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '11a',
              '11a. Time spent outside per week (walking, nature, fresh air)?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '11b',
              '11b. Daily routine structure compared to average?',
              'Chaotic',
              'Average',
              'Very structured'
            )}
            {renderSliderQuestion(
              '11c',
              '11c. Active goals/projects compared to average?',
              'Well below',
              'Average',
              'Well above'
            )}
          </CardContent>
        </Card>

        {/* 12. Mental Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">12. Mental Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '12a',
              '12a. Mental health treatment history',
              'No treatment',
              'Moderate treatment',
              'Fully stable/No issues'
            )}
          </CardContent>
        </Card>

        {/* Placeholder for results */}
        <Card className="bg-slate-900 border-dashed">
          <CardContent className="pt-6 text-center text-slate-400">
            Results calculation coming soon...
          </CardContent>
        </Card>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
