import React, { createContext, useContext, useState } from 'react';

const ProposalContext = createContext();

export const useProposals = () => {
    const context = useContext(ProposalContext);
    if (!context) {
        throw new Error('useProposals must be used within a ProposalProvider');
    }
    return context;
};

export const ProposalProvider = ({ children }) => {
    const [proposals, setProposals] = useState([]);

    const addProposal = (newProposal) => {
        setProposals((prev) => [
            {
                id: Date.now(),
                ...newProposal,
                status: 'pending',
                submittedDate: new Date().toLocaleDateString('en-GB') // DD/MM/YYYY
            },
            ...prev
        ]);
    };

    const getStats = () => {
        return {
            pending: proposals.filter(p => p.status === 'pending').length,
            accepted: proposals.filter(p => p.status === 'accepted').length,
            rejected: proposals.filter(p => p.status === 'rejected').length
        };
    };

    return (
        <ProposalContext.Provider value={{ proposals, addProposal, getStats }}>
            {children}
        </ProposalContext.Provider>
    );
};
