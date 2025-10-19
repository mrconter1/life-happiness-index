'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Answers {
  [key: string]: string;
}

export default function Home() {
  const [answers, setAnswers] = useState<Answers>({});
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [salary, setSalary] = useState('');
  const [savings, setSavings] = useState('');
  const [score, setScore] = useState<number | null>(null);

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

  const getBMIScore = (): number | null => {
    const bmi = calculateBMI();
    if (!bmi) return null;
    const bmiNum = parseFloat(bmi);
    
    if (bmiNum < 17.0) return 0;
    if (bmiNum < 18.5) return 2;
    if (bmiNum < 20.1) return 5;
    if (bmiNum < 23.1) return 9;
    if (bmiNum < 25.1) return 7;
    if (bmiNum < 27.6) return 4;
    if (bmiNum < 30.0) return 2;
    return 0;
  };

  const getSavingsScore = (): number | null => {
    const percentage = calculateSavingsPercentage();
    if (!percentage) return null;
    const pct = parseFloat(percentage);
    
    if (pct < 0) return 0;
    if (pct < 5) return 2;
    if (pct < 10) return 4;
    if (pct < 15) return 6;
    if (pct < 20) return 7;
    if (pct < 30) return 8;
    return 9;
  };

  // Convert z-score to percentile using approximation of normal CDF
  const zScoreToPercentile = (z: number): number => {
    // Approximation of cumulative distribution function for standard normal
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z >= 0 ? 1 - probability : probability;
  };

  const calculateScore = () => {
    const scores: number[] = [];
    
    console.log('=== DEBUG: Calculate Score (Z-Score Method) ===');
    console.log('Raw answers:', answers);
    console.log('Height:', height, 'Weight:', weight);
    console.log('Salary:', salary, 'Savings:', savings);
    
    // Questions where LEFT (0) is BEST and should be inverted
    const invertedQuestions = ['5a', '5b', '5d', '5e', '1e', '11e'];
    
    // Add all slider question scores with z-score transformation
    Object.entries(answers).forEach(([key, value]) => {
      let rawValue = parseFloat(value);
      
      // Invert if this question has best answer on left
      if (invertedQuestions.includes(key)) {
        const originalValue = rawValue;
        rawValue = 10 - rawValue; // Flip the scale
        console.log(`Question ${key}: ${originalValue.toFixed(1)} → INVERTED to ${rawValue.toFixed(1)}`);
      } else {
        console.log(`Question ${key}: ${rawValue.toFixed(1)}`);
      }
      
      // Convert to z-score (assuming 5 = mean, 2 = 1 SD)
      // 0/10 = -2.5 SD, 5/10 = 0 SD, 10/10 = +2.5 SD
      const zScore = (rawValue - 5) / 2;
      
      // Convert z-score to percentile (0-1)
      const percentile = zScoreToPercentile(zScore);
      
      // Convert percentile to 0-10 scale
      const normalizedScore = percentile * 10;
      
      console.log(`  → z-score: ${zScore.toFixed(2)}, percentile: ${(percentile * 100).toFixed(1)}%, score: ${normalizedScore.toFixed(2)}`);
      scores.push(normalizedScore);
    });
    
    // Add BMI score if available (0-9 scale, convert via z-score)
    const bmiScore = getBMIScore();
    console.log('BMI Score (0-9):', bmiScore);
    if (bmiScore !== null) {
      // Scale 0-9 to 0-10 first
      const scaled = (bmiScore / 9) * 10;
      // Then apply z-score transformation
      const zScore = (scaled - 5) / 2;
      const percentile = zScoreToPercentile(zScore);
      const normalizedScore = percentile * 10;
      console.log(`  → scaled: ${scaled.toFixed(2)}, z: ${zScore.toFixed(2)}, percentile: ${(percentile * 100).toFixed(1)}%, score: ${normalizedScore.toFixed(2)}`);
      scores.push(normalizedScore);
    }
    
    // Add savings score if available (0-9 scale, convert via z-score)
    const savingsScore = getSavingsScore();
    console.log('Savings Score (0-9):', savingsScore);
    if (savingsScore !== null) {
      // Scale 0-9 to 0-10 first
      const scaled = (savingsScore / 9) * 10;
      // Then apply z-score transformation
      const zScore = (scaled - 5) / 2;
      const percentile = zScoreToPercentile(zScore);
      const normalizedScore = percentile * 10;
      console.log(`  → scaled: ${scaled.toFixed(2)}, z: ${zScore.toFixed(2)}, percentile: ${(percentile * 100).toFixed(1)}%, score: ${normalizedScore.toFixed(2)}`);
      scores.push(normalizedScore);
    }
    
    console.log('All scores:', scores);
    
    if (scores.length === 0) {
      alert('Please answer at least one question before calculating your score.');
      return;
    }
    
    // Calculate arithmetic mean (simple average)
    const sum = scores.reduce((acc, val) => acc + val, 0);
    const arithmeticMean = sum / scores.length;
    console.log('Sum:', sum);
    console.log('N (count):', scores.length);
    console.log('Arithmetic mean:', arithmeticMean);
    console.log('Final score (0-10):', arithmeticMean);
    console.log('=== END DEBUG ===');
    
    setScore(arithmeticMean);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const renderSliderQuestion = (
    questionId: string,
    title: string,
    minLabel: string,
    midLabel: string,
    maxLabel: string
  ) => {
    const value = answers[questionId] ? parseFloat(answers[questionId]) : 5;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{title}</Label>
          <span className="text-sm font-semibold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full">
            {value.toFixed(1)}/10
          </span>
        </div>
        <div className="space-y-2 pt-2">
          <Slider
            value={[value]}
            onValueChange={(vals) => handleAnswerChange(questionId, vals[0].toString())}
            min={0}
            max={10}
            step={0.1}
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

        {/* Career & Income */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Career & Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '1a',
              'Annual salary compared to people your age?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '1b',
              'Hours working per week compared to average?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '1c',
              'Net worth compared to people your age?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '1d',
              'How comfortable is your job?',
              'Very uncomfortable',
              'Average',
              'Very comfortable'
            )}
            {renderSliderQuestion(
              '1e',
              'Daily commute time?',
              'Under 15 min/remote',
              '30-60 min',
              '2+ hours'
            )}
          </CardContent>
        </Card>

        {/* Exercise */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Exercise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '2a',
              'How many times per week do you exercise?',
              '0 times',
              '3-4 times',
              '7+ times'
            )}
            {renderSliderQuestion(
              '2b',
              'How intense is your exercise on average?',
              'None',
              'Moderate',
              'Athlete-level'
            )}
          </CardContent>
        </Card>

        {/* Social Life */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Social Life</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '3a',
              'How many hours per day do you interact with friends?',
              'Well below average',
              'Average (~1hr/day)',
              'Well above average'
            )}
            {renderSliderQuestion(
              '3b',
              'How many close friends do you have?',
              '0-1 friends',
              '5-8 friends',
              '16+ friends'
            )}
            {renderSliderQuestion(
              '3c',
              'Length of your longest active friendship (years)?',
              'Less than 1',
              '10 years',
              '20+ years'
            )}
          </CardContent>
        </Card>

        {/* Financial Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Monthly salary</Label>
                  <span className="text-sm font-semibold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full">
                    {parseFloat(salary || '0').toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2 pt-2">
                  <Slider
                    value={[parseFloat(salary || '0')]}
                    onValueChange={(vals) => setSalary(vals[0].toString())}
                    min={0}
                    max={150000}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>0</span>
                    <span>75k</span>
                    <span>150k</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Monthly savings</Label>
                  <span className="text-sm font-semibold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full">
                    {parseFloat(savings || '0') >= 0 ? '+' : ''}{parseFloat(savings || '0').toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2 pt-2">
                  <Slider
                    value={[parseFloat(savings || '0')]}
                    onValueChange={(vals) => setSavings(vals[0].toString())}
                    min={-10000}
                    max={50000}
                    step={500}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>-10k</span>
                    <span>20k</span>
                    <span>50k</span>
                  </div>
                </div>
              </div>

              {calculateSavingsPercentage() && (
                <div className="text-center pt-2">
                  <p className="text-sm text-slate-400">
                    Savings rate: <span className="font-semibold text-green-400">{calculateSavingsPercentage()}%</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Physical Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Physical Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '5a',
              'How many alcoholic drinks per week?',
              '0 drinks',
              '7-8 drinks',
              '15+ drinks'
            )}
            {renderSliderQuestion(
              '5b',
              'How many times per week do you use nicotine/tobacco?',
              'Never',
              '3-4 times',
              'Daily (7+)'
            )}
            {renderSliderQuestion(
              '5c',
              'Dental hygiene routine?',
              'Never',
              'Brush once daily',
              'Brush & floss 2x daily'
            )}
            {renderSliderQuestion(
              '5d',
              'How many times per week do you use recreational drugs?',
              'Never',
              '3-4 times',
              'Daily (7+)'
            )}
            {renderSliderQuestion(
              '5e',
              'Chronic health conditions (e.g., back pain, migraines, arthritis)?',
              'None',
              'Manageable',
              'Terminal/severe'
            )}
            {renderSliderQuestion(
              '5f',
              'Personal hygiene (showering/grooming frequency)?',
              'Well below average',
              'Average',
              'Well above average'
            )}
            
            {/* BMI Calculator */}
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Height (cm)</Label>
                  <span className="text-sm font-semibold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full">
                    {parseFloat(height || '0')} cm
                  </span>
                </div>
                <div className="space-y-2 pt-2">
                  <Slider
                    value={[parseFloat(height || '0')]}
                    onValueChange={(vals) => setHeight(vals[0].toString())}
                    min={140}
                    max={220}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>140 cm</span>
                    <span>180 cm</span>
                    <span>220 cm</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Weight (kg)</Label>
                  <span className="text-sm font-semibold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-full">
                    {parseFloat(weight || '0')} kg
                  </span>
        </div>
                <div className="space-y-2 pt-2">
                  <Slider
                    value={[parseFloat(weight || '0')]}
                    onValueChange={(vals) => setWeight(vals[0].toString())}
                    min={40}
                    max={200}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 px-1">
                    <span>40 kg</span>
                    <span>120 kg</span>
                    <span>200 kg</span>
                  </div>
                </div>
              </div>

              {calculateBMI() && (
                <div className="text-center pt-2">
                  <p className="text-sm text-slate-400">
                    BMI: <span className="font-semibold text-purple-400">{calculateBMI()}</span>
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Education & Nutrition */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Education & Nutrition</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '6a',
              'Education level compared to people your age?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '6b',
              'How healthy do you eat overall?',
              'Very unhealthy',
              'Average',
              'Very healthy'
            )}
          </CardContent>
        </Card>

        {/* Hobbies & Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Hobbies & Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '7a',
              'Number of hobbies compared to average?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '7b',
              'Skill level in hobbies compared to average person?',
              'Beginner',
              'Average',
              'Expert'
            )}
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sleep</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '8a',
              'Sleep hours compared to recommended average?',
              'Well below',
              'Average',
              'Optimal'
            )}
          </CardContent>
        </Card>

        {/* Romantic Relationship */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Romantic Relationship</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '9a',
              'How many years in your current relationship?',
              'None (single)',
              '3-4 years',
              '8+ years'
            )}
            {renderSliderQuestion(
              '9b',
              'Sexual activity frequency?',
              'Never',
              'Monthly',
              'Multiple times/week'
            )}
          </CardContent>
        </Card>

        {/* Family Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Family Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '10a',
              'How good are your family relationships?',
              'Very poor',
              'Average',
              'Very good'
            )}
          </CardContent>
        </Card>

        {/* Daily Structure & Outdoor */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Daily Structure & Outdoor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '11a',
              'Time spent outside per week (walking, nature, fresh air)?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '11b',
              'Daily routine structure compared to average?',
              'Chaotic',
              'Average',
              'Very structured'
            )}
            {renderSliderQuestion(
              '11c',
              'Active goals/projects compared to average?',
              'Well below',
              'Average',
              'Well above'
            )}
            {renderSliderQuestion(
              '11d',
              'How tidy/clean is your home compared to average?',
              'Very messy',
              'Average',
              'Very clean & organized'
            )}
            {renderSliderQuestion(
              '11e',
              'Hours per day on recreational screens/social media?',
              'Under 1 hour',
              '2-4 hours',
              '6+ hours'
            )}
          </CardContent>
        </Card>

        {/* Mental Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Mental Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderSliderQuestion(
              '12a',
              'If mental health has been a challenge, how thoroughly have you addressed it?',
              'No effort',
              'Serious effort',
              'N/A or exhaustive'
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card id="results" className="border-2 border-blue-500/50">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Calculate Your Score</CardTitle>
            <CardDescription className="text-base mt-2">
              Your responses are processed locally using statistical z-score transformation.
              <span className="block mt-1 text-slate-300 font-medium">
                🔒 No data is sent to any server.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={calculateScore}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                Calculate Happiness Index
              </button>
            </div>

            {score !== null && (
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-950/50 to-purple-950/50 rounded-lg border border-blue-500/30">
                <div className="text-center space-y-4">
                  <h3 className="text-xl font-semibold text-slate-200">Your Life Happiness Index</h3>
                  <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {score.toFixed(2)}
                  </div>
                  <p className="text-sm text-slate-400">out of 10</p>
                  {/* Band label */}
                  {(() => {
                    const s = score ?? 0;
                    const band =
                      s < 4 ? "Below average" : s < 6 ? "Average" : s < 8 ? "Above average" : "Exceptional";
                    const pct =
                      s < 4 ? "~15th pct" : s < 6 ? "~50th pct" : s < 8 ? "~80th pct" : "~95th pct";
                    return (
                      <p className="text-sm text-slate-300 italic">
                        {band} • {pct}
                      </p>
                    );
                  })()}
                  {/* Bell curve with marker */}
                  <div className="mt-6 h-32">
                    {(() => {
                      // Generate normal distribution curve
                      const labels = [];
                      const bellData = [];
                      const markerData = [];
                      
                      for (let x = 0; x <= 10; x += 0.2) {
                        labels.push(x.toFixed(1));
                        // Normal PDF: mean=5, sd=2
                        const z = (x - 5) / 2;
                        const y = (1 / (2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
                        bellData.push(y);
                        
                        // Add marker point at user's score
                        if (score !== null && Math.abs(x - score) < 0.1) {
                          const userZ = (score - 5) / 2;
                          const userY = (1 / (2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * userZ * userZ);
                          markerData.push(userY);
                        } else {
                          markerData.push(null);
                        }
                      }
                      
                      const verticalLinePlugin = {
                        id: 'verticalLine',
                        afterDraw: (chart: any) => {
                          if (score !== null) {
                            const ctx = chart.ctx;
                            const xAxis = chart.scales.x;
                            const yAxis = chart.scales.y;
                            
                            // Find x position for the score
                            const xPos = xAxis.getPixelForValue(score.toFixed(1));
                            
                            // Calculate y position on the bell curve
                            const z = (score - 5) / 2;
                            const yValue = (1 / (2 * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
                            const yPos = yAxis.getPixelForValue(yValue);
                            
                            ctx.save();
                            // Draw vertical line
                            ctx.beginPath();
                            ctx.moveTo(xPos, yAxis.bottom);
                            ctx.lineTo(xPos, yPos);
                            ctx.lineWidth = 2;
                            ctx.strokeStyle = '#38bdf8';
                            ctx.stroke();
                            
                            // Draw circle on top
                            ctx.beginPath();
                            ctx.arc(xPos, yPos, 4, 0, 2 * Math.PI);
                            ctx.fillStyle = '#38bdf8';
                            ctx.fill();
                            ctx.restore();
                          }
                        }
                      };
                      
                      return (
                        <Line
                          data={{
                            labels,
                            datasets: [
                              {
                                label: 'Population',
                                data: bellData,
                                borderColor: '#64748b',
                                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                              }
                            ]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false },
                            },
                            scales: {
                              x: {
                                grid: { display: false },
                                ticks: { 
                                  color: '#94a3b8',
                                  maxTicksLimit: 6,
                                }
                              },
                              y: {
                                display: false,
                              }
                            }
                          }}
                          plugins={[verticalLinePlugin]}
                        />
                      );
                    })()}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Score is a percentile-weighted average of all answers (z-score method). 
                      Data never leaves your browser.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-slate-400 mt-6">
              <p>
                Open source • View code on{' '}
                <a 
                  href="https://github.com/mrconter1/life-happiness-index" 
          target="_blank"
          rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  GitHub
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer spacing */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
