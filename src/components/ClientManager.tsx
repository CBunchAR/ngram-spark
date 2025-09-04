import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Users, 
  ChevronDown, 
  Calendar,
  BarChart3,
  Trash2,
  Building2
} from 'lucide-react';
import { Client } from '@/types/client';
import { 
  getClients, 
  saveClient, 
  deleteClient, 
  getCurrentClient, 
  setCurrentClient, 
  createClient,
  getAnalysisHistory 
} from '@/utils/storage';

interface ClientManagerProps {
  onClientChange: (client: Client | null) => void;
}

export function ClientManager({ onClientChange }: ClientManagerProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentClient, setCurrentClientState] = useState<Client | null>(null);
  const [newClientName, setNewClientName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadClients();
    const savedClient = getCurrentClient();
    if (savedClient) {
      setCurrentClientState(savedClient);
      onClientChange(savedClient);
    }
  }, []); // Remove onClientChange from dependencies to prevent infinite loop

  const loadClients = () => {
    const loadedClients = getClients();
    setClients(loadedClients);
  };

  const handleCreateClient = () => {
    if (!newClientName.trim()) return;
    
    const newClient = createClient(newClientName.trim());
    saveClient(newClient);
    loadClients();
    handleSelectClient(newClient);
    setNewClientName('');
    setIsDialogOpen(false);
  };

  const handleSelectClient = (client: Client) => {
    setCurrentClientState(client);
    setCurrentClient(client);
    onClientChange(client);
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client? All analysis data will be lost.')) {
      deleteClient(clientId);
      loadClients();
      
      if (currentClient?.id === clientId) {
        setCurrentClientState(null);
        setCurrentClient(null);
        onClientChange(null);
      }
    }
  };

  const getClientStats = (client: Client) => {
    const history = getAnalysisHistory(client.id);
    return {
      analysisCount: history.length,
      lastAnalysis: history.length > 0 ? history[0].timestamp : null
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg text-gray-900">Client Management</CardTitle>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="client-name" className="text-gray-700">Client Name</Label>
                  <Input
                    id="client-name"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Enter client name..."
                    className="mt-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateClient()}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateClient} disabled={!newClientName.trim()}>
                    Create Client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[200px] justify-between">
                  {currentClient ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: currentClient.color }}
                      />
                      <span className="text-gray-900">{currentClient.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a client...</span>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px]">
                {clients.length === 0 ? (
                  <DropdownMenuItem disabled>
                    <Users className="w-4 h-4 mr-2" />
                    No clients yet
                  </DropdownMenuItem>
                ) : (
                  <>
                    {clients.map((client) => {
                      const stats = getClientStats(client);
                      return (
                        <DropdownMenuItem 
                          key={client.id}
                          onClick={() => handleSelectClient(client)}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: client.color }}
                            />
                            <div>
                              <p className="font-medium text-gray-900">{client.name}</p>
                              <p className="text-xs text-gray-500">
                                {stats.analysisCount} analyses
                                {stats.lastAnalysis && ` • Last: ${formatDate(stats.lastAnalysis)}`}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClient(client.id);
                            }}
                            className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </DropdownMenuItem>
                      );
                    })}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Client
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {currentClient && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>{getClientStats(currentClient).analysisCount} analyses</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(currentClient.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-gray-600">
              {clients.length} total clients
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
