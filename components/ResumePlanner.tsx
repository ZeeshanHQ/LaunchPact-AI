import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import LaunchPlanner from './LaunchPlanner';
import { ProductBlueprint } from '../types';
import { Loader2 } from 'lucide-react';

const ResumePlanner: React.FC = () => {
    const { planId } = useParams<{ planId: string }>();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [planData, setPlanData] = useState<{
        blueprint: ProductBlueprint;
        initialState: any;
    } | null>(null);

    useEffect(() => {
        const loadPlan = async () => {
            if (!planId) return;

            try {
                const { data: plan, error } = await supabase
                    .from('plans')
                    .select('*')
                    .eq('id', planId)
                    .single();

                if (error || !plan) {
                    console.error('Plan not found:', error);
                    navigate('/dashboard'); // or show error
                    return;
                }

                setPlanData({
                    blueprint: plan.blueprint,
                    initialState: {
                        id: plan.id,
                        executionPlan: plan.execution_plan,
                        timeline: plan.timeline,
                        teamSetup: plan.team_setup
                    }
                });

            } catch (error) {
                console.error('Error loading plan:', error);
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        loadPlan();
    }, [planId, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 size={40} className="text-indigo-600 animate-spin mx-auto mb-4" />
                    <h2 className="text-lg font-bold text-slate-700">Resuming Mission...</h2>
                </div>
            </div>
        );
    }

    if (!planData) return null;

    return (
        <LaunchPlanner
            blueprint={planData.blueprint}
            initialState={planData.initialState}
            onLockPlan={() => {
                // Determine what to do on lock from a resumed plan.
                // Usually redirect to daily tasks or dashboard.
                // For now, let LaunchPlanner handle the logic (it calls onLockPlan which typically updates App state).
                // But ResumePlanner is a Route component, not passed from App with props to update App state.
                // So we might need to update App state manually or just navigate?
                // The onLockPlan prop in App.tsx updates 'projects' and 'activePlan'.
                // Reuse that logic?
                // For now, simpler: Navigate to dashboard. The plan is locked in DB by LaunchPlanner.
                navigate('/dashboard');
            }}
            onExit={() => navigate('/dashboard')}
        />
    );
};

export default ResumePlanner;
