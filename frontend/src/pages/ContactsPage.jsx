import { useState, useMemo } from 'react';
import Layout from '../components/layout/Layout';
import ContactsList from '../components/contacts/ContactsList';
import AddContactModal from '../components/contacts/AddContactModal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useCall } from '../context/CallContext';
import { useContacts } from '../hooks/useContacts';
import { contactsAPI } from '../services/api';

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { startCall } = useCall();
  const { contacts, loading: isLoading, error, fetchContacts } = useContacts();

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(
      (contact) =>
        (contact.full_name || contact.contact_name || '').toLowerCase().includes(query) ||
        (contact.email || contact.contact_email || '').toLowerCase().includes(query)
    );
  }, [searchQuery, contacts]);

  const handleCall = (contact) => {
    console.log('Calling:', contact);
    // Start the call using CallContext
    startCall(contact);
  };

  const handleAddContact = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddContactSubmit = async (contactData) => {
    try {
      console.log('Adding contact:', contactData);
      
      // Call the backend API to add contact
      await contactsAPI.addContact(contactData.name, contactData.email);
      
      // Refresh contacts list
      await fetchContacts();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to add contact:', error);
      throw new Error(error.message || 'Failed to add contact');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contacts</h1>
            <p className="text-gray-400">
              Manage your contacts and see who's online
            </p>
          </div>
          
          <Button variant="primary" onClick={handleAddContact}>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Contact
            </span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="card p-4">
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Contacts List */}
        <div>
          {searchQuery && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-gray-400 text-sm">
                Found {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
          
          <ContactsList
            contacts={filteredContacts}
            isLoading={isLoading}
            onCall={handleCall}
            onAddContact={handleAddContact}
          />
          
          {searchQuery && filteredContacts.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-gray-400 mb-4">
                No contacts found matching "{searchQuery}"
              </p>
              <Button variant="secondary" onClick={() => setSearchQuery('')}>
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Online Status Legend */}
        <div className="card p-4">
          <p className="text-sm font-medium text-gray-400 mb-3">Status Indicators:</p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success-light" />
              <span className="text-sm text-gray-400">Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-sm text-gray-400">Offline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger-light" />
              <span className="text-sm text-gray-400">Busy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-warning-light" />
              <span className="text-sm text-gray-400">In Call</span>
            </div>
          </div>
        </div>

        {/* Add Contact Modal */}
        <AddContactModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAdd={handleAddContactSubmit}
        />
      </div>
    </Layout>
  );
}
