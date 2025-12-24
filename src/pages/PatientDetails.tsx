import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { PatientRecords } from '../types';
import { useAuth } from '../context/AuthContext';

const PatientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<PatientRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  
  const [encounterNote, setEncounterNote] = useState('');
  
  const [prescriptionData, setPrescriptionData] = useState({
    drug_name: '',
    dosage: '',
    frequency: '',
    duration: '',
  });

  const fetchRecords = useCallback(async () => {
    try {
      const response = await api.get(`/patients/${id}/records`);
      setData(response.data);
    } catch (err: any) {
      setError('Failed to load patient records');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleEncounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await api.post('/encounters', {
        patient_id: id,
        clinician_role: user.role,
        notes: encounterNote
      });
      setEncounterNote('');
      fetchRecords();
    } catch (err) {
      alert('Failed to add encounter');
    }
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent, encounterId: number) => {
    e.preventDefault();
    try {
      await api.post('/prescriptions', {
        encounter_id: encounterId,
        ...prescriptionData
      });
      setPrescriptionData({ drug_name: '', dosage: '', frequency: '', duration: '' });
      fetchRecords();
    } catch (err) {
      alert('Failed to add prescription');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!data) return <div>No data found</div>;

  return (
    <div>
      <div style={{ background: '#fff', border: '1px solid #ddd', padding: '20px', marginBottom: '20px', borderRadius: '5px' }}>
        <h2 style={{ marginTop: 0 }}>{data.patient.full_name}</h2>
        <div style={{ display: 'flex', gap: '20px', color: '#555' }}>
           <span><strong>DOB:</strong> {new Date(data.patient.date_of_birth).toLocaleDateString()}</span>
           <span><strong>Gender:</strong> {data.patient.gender}</span>
           <span><strong>Phone:</strong> {data.patient.phone}</span>
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '5px' }}>
        <h3 style={{ marginTop: 0 }}>Add Clinical Encounter</h3>
        <form onSubmit={handleEncounterSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={encounterNote}
            onChange={(e) => setEncounterNote(e.target.value)}
            placeholder="Enter clinical notes here..."
            required
            style={{ flex: 1, padding: '10px', borderRadius: '3px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Add Encounter</button>
        </form>
      </div>

      <h3>Clinical History & Prescriptions</h3>
      {data.encounters.length === 0 ? <p>No history recorded yet.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.encounters.map(encounter => (
             <div key={encounter.id} style={{ border: '1px solid #e0e0e0', padding: '0', borderRadius: '5px', overflow: 'hidden' }}>
               <div style={{ background: '#f1f1f1', padding: '10px 15px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <strong>{new Date(encounter.created_at || '').toLocaleString()}</strong>
                 <span style={{ background: '#ddd', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8em', textTransform: 'uppercase' }}>{encounter.clinician_role}</span>
               </div>
               <div style={{ padding: '15px' }}>
                 <p style={{ marginTop: 0, fontSize: '1.1em' }}>{encounter.notes}</p>
                 
                 <div style={{ marginTop: '15px', borderTop: '1px dashed #eee', paddingTop: '10px' }}>
                   <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', textTransform: 'uppercase', color: '#666' }}>Prescriptions</h4>
                   
                   {data.prescriptions.filter(p => p.encounter_id === encounter.id).length === 0 && <p style={{ fontStyle: 'italic', color: '#999', fontSize: '0.9em' }}>None</p>}
                   
                   {data.prescriptions.filter(p => p.encounter_id === encounter.id).map(p => (
                     <div key={p.id} style={{ fontSize: '0.95em', marginBottom: '8px', padding: '8px', background: '#fafffa', borderLeft: '3px solid #28a745' }}>
                       <strong>{p.drug_name}</strong> {p.dosage} 
                       <span style={{ margin: '0 10px' }}>|</span> 
                       {p.frequency} for {p.duration}
                       {p.prescribed_by && <span style={{ color: '#888', float: 'right', fontSize: '0.85em' }}>Rx by {p.prescribed_by}</span>}
                     </div>
                   ))}

                   {/* Doctor-only Prescription Form */}
                   {user?.role === 'doctor' && (
                     <div style={{ marginTop: '15px', background: '#f8f8f8', padding: '10px', borderRadius: '3px' }}>
                       <p style={{ margin: '0 0 5px 0', fontSize: '0.85em', fontWeight: 'bold' }}>Add Prescription:</p>
                       <form onSubmit={(e) => handlePrescriptionSubmit(e, encounter.id)} style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                         <input placeholder="Drug Name" value={prescriptionData.drug_name} onChange={e => setPrescriptionData({...prescriptionData, drug_name: e.target.value})} required style={{ padding: '5px', flex: 1 }} />
                         <input placeholder="Dosage" value={prescriptionData.dosage} onChange={e => setPrescriptionData({...prescriptionData, dosage: e.target.value})} required style={{ padding: '5px', width: '80px' }} />
                         <input placeholder="Frequency" value={prescriptionData.frequency} onChange={e => setPrescriptionData({...prescriptionData, frequency: e.target.value})} required style={{ padding: '5px', width: '100px' }} />
                         <input placeholder="Duration" value={prescriptionData.duration} onChange={e => setPrescriptionData({...prescriptionData, duration: e.target.value})} required style={{ padding: '5px', width: '80px' }} />
                         <button type="submit" style={{ padding: '5px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>+ Rx</button>
                       </form>
                     </div>
                   )}
                 </div>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
