'use client';

import { useState } from 'react';
import { updateGroupDetails, addMemberToGroup, removeMemberFromGroup, deleteGroup } from '@/actions/group';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { X, Trash2, UserPlus, Settings, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Group = {
  id: string;
  name: string;
  description: string | null;
  simplifyDebts: boolean;
  members: {
    id: string;
    userId: string;
    role: string;
    user: {
       name: string;
       email: string;
       avatarUrl: string | null;
    }
  }[];
};

type Props = {
  group: Group;
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
};

export function GroupSettingsModal({ group, isOpen, onClose, currentUserId }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'danger'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // General Form
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [simplifyDebts, setSimplifyDebts] = useState(group.simplifyDebts);

  // Add Member
  const [newMemberEmail, setNewMemberEmail] = useState('');

  async function handleSaveGeneral() {
    setLoading(true);
    setError(null);
    const res = await updateGroupDetails(group.id, { name, description, simplifyDebts });
    if (res.error) setError(res.error);
    else {
        onClose();
        router.refresh();
    }
    setLoading(false);
  }

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!newMemberEmail) return;
    setLoading(true);
    const res = await addMemberToGroup(group.id, newMemberEmail);
    if (res.error) setError(res.error);
    else {
        setNewMemberEmail('');
        router.refresh();
    }
    setLoading(false);
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setLoading(true);
    const res = await removeMemberFromGroup(group.id, userId);
    if (res.error) setError(res.error);
    else router.refresh();
    setLoading(false);
  }

  async function handleDeleteGroup() {
     if (!confirm('Are you sure? This cannot be undone.')) return;
     setLoading(true);
     const res = await deleteGroup(group.id);
     if (res.error) setError(res.error);
     else {
         router.push('/groups');
         router.refresh();
     }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="p-0 max-w-2xl h-[600px] flex flex-col">
            <div className="flex bg-gray-50 border-b border-gray-100 shrink-0">
                <button onClick={() => setActiveTab('general')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'general' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Settings className="w-4 h-4" /> General
                </button>
                <button onClick={() => setActiveTab('members')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'members' ? 'text-primary border-b-2 border-primary bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
                    <UserPlus className="w-4 h-4" /> Members
                </button>
                <button onClick={() => setActiveTab('danger')} className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 ${activeTab === 'danger' ? 'text-red-600 border-b-2 border-red-600 bg-red-50' : 'text-gray-500 hover:text-red-500'}`}>
                    <ShieldAlert className="w-4 h-4" /> Danger Zone
                </button>
                <button onClick={onClose} className="p-4 text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
                {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm font-bold">{error}</div>}

                {activeTab === 'general' && (
                    <div className="flex flex-col gap-4">
                        <Input label="Group Name" value={name} onChange={e => setName(e.target.value)} />
                        <div>
                             <label className="text-sm font-bold text-primary mb-1 block">Description</label>
                             <textarea 
                                className="input-edged w-full min-h-[100px]" 
                                value={description} 
                                onChange={e => setDescription(e.target.value)} 
                             />
                        </div>

                         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <h4 className="font-bold text-gray-800">Simplify Debts</h4>
                                <p className="text-xs text-gray-500 max-w-sm">
                                    Automatically combine debts to minimize total transactions. 
                                    (e.g. A owes B, B owes C = A owes C)
                                </p>
                            </div>
                            <button 
                                onClick={() => setSimplifyDebts(!simplifyDebts)}
                                className={`w-12 h-6 rounded-full transition-colors relative ${simplifyDebts ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${simplifyDebts ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="pt-4">
                            <Button onClick={handleSaveGeneral} isLoading={loading}>Save Changes</Button>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="flex flex-col gap-6">
                         <form onSubmit={handleAddMember} className="flex items-end gap-2">
                             <div className="flex-1">
                                 <Input label="Add Member by Email" placeholder="friend@example.com" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
                             </div>
                             <Button type="submit" isLoading={loading} className="mb-[2px]">
                                 <UserPlus className="w-5 h-5" />
                             </Button>
                         </form>

                         <div className="flex flex-col gap-2">
                             <h4 className="font-bold text-gray-700 text-sm">Current Members</h4>
                             {group.members.map(member => (
                                 <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-primary/20 transition-colors">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                             {member.user.avatarUrl ? <img src={member.user.avatarUrl} className="w-full h-full rounded-full" /> : member.user.name[0]}
                                         </div>
                                         <div>
                                             <div className="font-bold text-sm text-gray-800">{member.user.name}</div>
                                             <div className="text-xs text-gray-400">{member.user.email}</div>
                                         </div>
                                     </div>
                                     {member.userId !== currentUserId && (
                                         <button onClick={() => handleRemoveMember(member.userId)} className="text-gray-400 hover:text-red-500 p-2">
                                             <Trash2 className="w-4 h-4" />
                                         </button>
                                     )}
                                     {member.userId === currentUserId && (
                                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">You</span>
                                     )}
                                 </div>
                             ))}
                         </div>
                    </div>
                )}

                {activeTab === 'danger' && (
                    <div className="flex flex-col gap-4 text-center py-8">
                        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                             <ShieldAlert className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Delete this Group?</h3>
                        <p className="text-gray-500 max-w-xs mx-auto mb-4">
                            This action cannot be undone. All expenses and history will be permanently removed.
                        </p>
                        <Button variant="danger" onClick={handleDeleteGroup} isLoading={loading}>
                            Delete Group Permanently
                        </Button>
                    </div>
                )}
            </div>
    </Modal>
  );
}
