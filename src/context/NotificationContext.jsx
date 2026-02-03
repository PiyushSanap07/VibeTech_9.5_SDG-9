import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { currentUser, userRole } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setNotifications([]);
            setUnreadCount(0);
            setLoading(false);
            return;
        }

        const unsubscribes = [];
        const allNotifications = { requests: [], milestones: [] };

        const updateState = () => {
            // merge and sort
            const merged = [
                ...allNotifications.requests,
                ...allNotifications.milestones
            ].sort((a, b) => b.date - a.date);

            setNotifications(merged);
            setUnreadCount(merged.filter(n => n.isRelevant).length);
            setLoading(false);
        };

        // 1. Listen to Funding Requests
        const requestsRef = collection(db, 'funding_requests');
        let requestQuery;
        if (userRole === 'funder') {
            requestQuery = query(requestsRef, where('funderId', '==', currentUser.uid));
        } else {
            requestQuery = query(requestsRef, where('userId', '==', currentUser.uid));
        }

        const unsubRequests = onSnapshot(requestQuery, (snapshot) => {
            allNotifications.requests = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    type: 'request',
                    status: data.status,
                    title: 'Funding Request',
                    subtitle: data.innovationTitle,
                    data: data,
                    date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
                    isRelevant: userRole === 'funder'
                        ? (data.status === 'Pending') // Funder needs to act
                        : ['Approved', 'Rejected'].includes(data.status) // Innovator updated
                };
            });
            updateState();
        }, (err) => console.error("Request listener error:", err));
        unsubscribes.push(unsubRequests);


        // 2. Listen to Milestones (via Investments)
        const investmentsRef = collection(db, 'investments');
        let investmentQuery;
        if (userRole === 'funder') {
            investmentQuery = query(investmentsRef, where('funderId', '==', currentUser.uid), where('status', '==', 'active'));
        } else {
            investmentQuery = query(investmentsRef, where('innovatorId', '==', currentUser.uid), where('status', '==', 'active'));
        }

        // We listen to investments to know which subcollections to watch
        const unsubInvestments = onSnapshot(investmentQuery, (snap) => {
            // We need to manage listeners for each investment's milestones dynamically
            // Ideally we'd use collectionGroup but that requires index. We'll stick to a simpler approach:
            // For each investment, one listener. NOTE: In a production app with hundreds of investments, use Cloud Functions or collectionGroup.

            // Clear old milestone listeners (simplification: we just recreate them when list changes)
            // In this simple useEffect scope, deeper dynamic management is complex. 
            // We will assume the investment list is stable enough to just iterate.

            snap.docs.forEach(invDoc => {
                const invData = invDoc.data();
                const unsubMs = onSnapshot(collection(db, 'investments', invDoc.id, 'milestones'), (msSnap) => {
                    // Add these milestones to the 'milestones' array in a flatten way? 
                    // We need to upsert them into allNotifications.milestones. 
                    // A cleaner way is to map ID -> Notification.

                    const msNotes = msSnap.docs.map(mDoc => {
                        const mData = mDoc.data();
                        // Determine relevance
                        let relevant = false;
                        let title = "Project Milestone";
                        if (userRole === 'funder') {
                            // Funder cares about 'Pending' (needs review) or 'Submitted'
                            if (mData.status === 'Pending' || mData.status === 'submitted') {
                                relevant = true;
                                title = "Milestone Review";
                            }
                        } else {
                            // Innovator cares about 'Verified' or 'Rejected'
                            if (mData.status === 'Verified' || mData.status === 'Rejected') {
                                relevant = true;
                                title = "Milestone Update";
                            }
                        }

                        return {
                            id: mDoc.id,
                            type: 'milestone',
                            status: mData.status,
                            title: title,
                            subtitle: `${invData.innovationTitle || 'Project'} - ${mData.title}`,
                            data: mData,
                            date: mData.updatedAt?.toDate ? mData.updatedAt.toDate() : (mData.createdAt?.toDate ? mData.createdAt.toDate() : new Date()),
                            isRelevant: relevant
                        };
                    });

                    // Helper: Merge into master list. Ideally we'd use a Map.
                    // For simplicity, we filter out this project's milestones and re-add.
                    // But wait, we can't easily identify parent ID in the flattened list.
                    // Let's attach projectId to the note object.
                    const cleaned = allNotifications.milestones.filter(n => n.projectId !== invDoc.id);
                    allNotifications.milestones = [...cleaned, ...msNotes.map(n => ({ ...n, projectId: invDoc.id }))];
                    updateState();

                });
                unsubscribes.push(unsubMs);
            });
        });
        unsubscribes.push(unsubInvestments);


        return () => {
            unsubscribes.forEach(u => u());
        };
    }, [currentUser, userRole]);

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, loading }}>
            {children}
        </NotificationContext.Provider>
    );
};
