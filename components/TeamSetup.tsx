import React, { useState } from 'react';
import { TeamMember, TeamMemberRole } from '../types';
import { Users, Plus, X, Mail, Briefcase, UserCheck, AlertCircle, Send } from 'lucide-react';

interface TeamSetupProps {
    productName: string;
    onComplete: (setupType: 'solo' | 'team', members: TeamMember[]) => void;
    onBack: () => void;
}

const ROLE_OPTIONS: { value: TeamMemberRole; label: string; requiresApproval: boolean; description: string }[] = [
    { value: 'co-founder', label: 'Co-Founder', requiresApproval: true, description: 'Equal decision-making power' },
    { value: 'technical-lead', label: 'Technical Lead', requiresApproval: true, description: 'Technical decisions' },
    { value: 'designer', label: 'Designer', requiresApproval: false, description: 'UI/UX and design' },
    { value: 'developer', label: 'Developer', requiresApproval: false, description: 'Implementation' },
    { value: 'marketer', label: 'Marketer', requiresApproval: false, description: 'Growth and marketing' },
    { value: 'advisor', label: 'Advisor', requiresApproval: false, description: 'Strategic guidance' },
    { value: 'team-member', label: 'Team Member', requiresApproval: false, description: 'General collaboration' }
];

const TeamSetup: React.FC<TeamSetupProps> = ({ productName, onComplete, onBack }) => {
    const [setupType, setSetupType] = useState<'solo' | 'team' | null>(null);
    const [members, setMembers] = useState<Partial<TeamMember>[]>([]);
    const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({
        name: '',
        email: '',
        expertise: '',
        role: 'team-member'
    });

    const addMember = () => {
        if (!currentMember.name || !currentMember.email || !currentMember.expertise || !currentMember.role) {
            return;
        }

        const roleInfo = ROLE_OPTIONS.find(r => r.value === currentMember.role);
        const newMember: TeamMember = {
            id: Math.random().toString(36).substring(7),
            name: currentMember.name,
            email: currentMember.email,
            expertise: currentMember.expertise,
            role: currentMember.role as TeamMemberRole,
            approvalRequired: roleInfo?.requiresApproval || false,
            hasApproved: false,
            invitedAt: new Date().toISOString()
        };

        setMembers([...members, newMember]);
        setCurrentMember({ name: '', email: '', expertise: '', role: 'team-member' });
    };

    const removeMember = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
    };

    const handleComplete = () => {
        if (setupType === 'solo') {
            onComplete('solo', []);
        } else {
            onComplete('team', members as TeamMember[]);
        }
    };

    const requiredApprovals = members.filter(m => {
        const roleInfo = ROLE_OPTIONS.find(r => r.value === m.role);
        return roleInfo?.requiresApproval;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-2xl mb-4">
                    <Users className="text-indigo-600" size={24} />
                    <h2 className="text-2xl font-black uppercase italic text-slate-900">Team Setup</h2>
                </div>
                <p className="text-slate-600 font-medium">Are you building solo or with a team?</p>
            </div>

            {/* Solo vs Team Selection */}
            {!setupType && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                    <button
                        onClick={() => setSetupType('solo')}
                        className="group p-8 bg-white rounded-[2rem] border-2 border-slate-200 hover:border-indigo-500 hover:shadow-xl transition-all text-left"
                    >
                        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                            <UserCheck className="text-indigo-600 group-hover:text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase text-slate-900 mb-2">Solo Founder</h3>
                        <p className="text-slate-600 font-medium">Building alone. Lock and start immediately.</p>
                    </button>

                    <button
                        onClick={() => setSetupType('team')}
                        className="group p-8 bg-white rounded-[2rem] border-2 border-slate-200 hover:border-purple-500 hover:shadow-xl transition-all text-left"
                    >
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                            <Users className="text-purple-600 group-hover:text-white" size={32} />
                        </div>
                        <h3 className="text-xl font-black uppercase text-slate-900 mb-2">Team</h3>
                        <p className="text-slate-600 font-medium">Collaborate with co-founders and team members.</p>
                    </button>
                </div>
            )}

            {/* Team Member Collection */}
            {setupType === 'team' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Info Alert */}
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-bold text-amber-900 text-sm">Role-Based Approvals</p>
                                <p className="text-amber-800 text-xs mt-1">
                                    <strong>Co-Founders</strong> and <strong>Technical Leads</strong> must approve before locking. Other roles can review and provide feedback.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Add Member Form */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                        <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest mb-6">Add Team Member</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Name</label>
                                <input
                                    type="text"
                                    value={currentMember.name || ''}
                                    onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Email</label>
                                <input
                                    type="email"
                                    value={currentMember.email || ''}
                                    onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Expertise</label>
                                <input
                                    type="text"
                                    value={currentMember.expertise || ''}
                                    onChange={(e) => setCurrentMember({ ...currentMember, expertise: e.target.value })}
                                    placeholder="Frontend Developer"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Role</label>
                                <select
                                    value={currentMember.role || 'team-member'}
                                    onChange={(e) => setCurrentMember({ ...currentMember, role: e.target.value as TeamMemberRole })}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none font-medium"
                                >
                                    {ROLE_OPTIONS.map(role => (
                                        <option key={role.value} value={role.value}>
                                            {role.label} {role.requiresApproval && '(Approval Required)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={addMember}
                            disabled={!currentMember.name || !currentMember.email || !currentMember.expertise}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Add Member
                        </button>
                    </div>

                    {/* Team Members List */}
                    {members.length > 0 && (
                        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-slate-900 uppercase text-sm tracking-widest">Team Members ({members.length})</h3>
                                {requiredApprovals.length > 0 && (
                                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                        {requiredApprovals.length} Approval{requiredApprovals.length !== 1 && 's'} Required
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                {members.map((member, index) => {
                                    const roleInfo = ROLE_OPTIONS.find(r => r.value === member.role);
                                    return (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-slate-900">{member.name}</h4>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${roleInfo?.requiresApproval
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-slate-200 text-slate-600'
                                                        }`}>
                                                        {roleInfo?.label}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-slate-600">
                                                    <span className="flex items-center gap-1">
                                                        <Mail size={12} />
                                                        {member.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Briefcase size={12} />
                                                        {member.expertise}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeMember(index)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSetupType(null)}
                            className="px-6 py-3 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={members.length === 0}
                            className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Send size={20} />
                            Send Invitations & Continue
                        </button>
                    </div>
                </div>
            )}

            {/* Solo Confirmation */}
            {setupType === 'solo' && (
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    <div className="bg-indigo-50 p-8 rounded-[2rem] border border-indigo-100">
                        <UserCheck className="mx-auto text-indigo-600 mb-4" size={48} />
                        <h3 className="text-2xl font-black uppercase text-slate-900 mb-2">Solo Founder Mode</h3>
                        <p className="text-slate-600 font-medium">
                            You'll have full control and can lock the plan immediately to start building.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setSetupType(null)}
                            className="px-6 py-3 text-slate-600 hover:text-slate-900 font-bold transition-colors"
                        >
                            ← Back
                        </button>
                        <button
                            onClick={handleComplete}
                            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-indigo-700 hover:shadow-xl transition-all"
                        >
                            Continue as Solo Founder
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamSetup;
