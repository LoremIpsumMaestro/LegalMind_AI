                      placeholder="Search documents..."
                      className="flex-1"
                      prefix={<Search className="w-4 h-4" />}
                    />
                  </div>
                  <div className="space-y-2">
                    {currentConversation.documents.length > 0 ? (
                      currentConversation.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>{doc.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.date}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No documents attached to this conversation yet.
                        Click "Add Document" to upload files.
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* User Menu Button - Fixed Position */}
      <div className="fixed bottom-4 left-4 w-64">
        <Card>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full flex items-center justify-start p-4 gap-2">
                <User className="h-5 w-5" />
                <span>John Doe</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                User Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="flex items-center text-red-600" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete All Chats
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your chat
                      history and remove all associated data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setConversations([]);
                        setCurrentChat('new');
                      }}
                    >
                      Delete All Chats
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </Card>
      </div>
    </div>
  );
};

export default ChatInterface;