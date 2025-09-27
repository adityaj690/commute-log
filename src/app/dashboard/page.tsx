"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { CommuteLog, CommuteType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Settings, PlusCircle, LogOut, Menu, X } from "lucide-react";
import { AddEditLogDialog } from "@/components/dialogs/add-edit-log-dialog";
import { ManageTypesDialog } from "@/components/dialogs/manage-types-dialog";
import { CommuteLogList } from "@/components/dashboard/commute-log-list";
import { CommuteSummary } from "@/components/dashboard/commute-summary";
import { CommutePredictor } from "@/components/dashboard/commute-predictor";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import {
  getCommuteLogs,
  getCommuteTypes,
  saveCommuteLog,
  deleteCommuteLog,
  saveCommuteTypes,
} from "@/lib/firestore";
import { Loader2 } from "lucide-react";

const initialCommuteTypes: CommuteType[] = [
  { id: "1", name: "Car", icon: "Car" },
  { id: "2", name: "Bus", icon: "Bus" },
  { id: "3", name: "Train", icon: "TrainFront" },
  { id: "4", name: "Bike", icon: "Bike" },
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<CommuteLog[]>([]);
  const [types, setTypes] = useState<CommuteType[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [isAddEditDialogOpen, setAddEditDialogOpen] = useState(false);
  const [isManageTypesOpen, setManageTypesOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<CommuteLog | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/login");
      } else {
        const loadData = async () => {
          setDataLoading(true);
          const [userLogs, userTypes] = await Promise.all([
            getCommuteLogs(user.uid),
            getCommuteTypes(user.uid),
          ]);
          setLogs(userLogs);
          if (userTypes.length > 0) {
            setTypes(userTypes);
          } else {
            setTypes(initialCommuteTypes);
            await saveCommuteTypes(user.uid, initialCommuteTypes);
          }
          setDataLoading(false);
        };
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const handleAddLogClick = () => {
    setEditingLog(null);
    setAddEditDialogOpen(true);
  };

  const handleEditLogClick = (log: CommuteLog) => {
    setEditingLog(log);
    setAddEditDialogOpen(true);
  };

  const handleDeleteLog = async (logId: string) => {
    if (!user) return;
    await deleteCommuteLog(user.uid, logId);
    setLogs(logs.filter((log) => log.id !== logId));
  };

  const handleSaveLog = async (log: CommuteLog) => {
    if (!user) return;
    const savedLog = await saveCommuteLog(user.uid, log);
    if (editingLog) {
      setLogs(logs.map((l) => (l.id === savedLog.id ? savedLog : l)));
    } else {
      setLogs([savedLog, ...logs]);
    }
    setAddEditDialogOpen(false);
  };

  const handleSaveTypes = async (newTypes: CommuteType[]) => {
    if (!user) return;
    setTypes(newTypes);
    await saveCommuteTypes(user.uid, newTypes);
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const sortedLogs = logs.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b bg-card shadow-sm">
        <h1 className="text-2xl font-bold text-primary font-headline">
          CommuteLog
        </h1>

        <div className="hidden md:flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setManageTypesOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Manage Types
          </Button>
          <Button
            onClick={handleAddLogClick}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Log
          </Button>
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute top-16 right-4 bg-card shadow-lg rounded-lg p-4 flex flex-col gap-2 md:hidden z-50">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setManageTypesOpen(true)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Types
            </Button>
            <Button
              onClick={handleAddLogClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Log
            </Button>
          </div>
        )}
      </header>

      <main
        className="
    flex-1 
    p-4 md:p-6 
    grid gap-6 grid-cols-1 lg:grid-cols-3
    overflow-y-auto
    scrollbar-hide
  "
      >
        <div className="lg:col-span-2">
          <CommuteLogList
            logs={sortedLogs}
            commuteTypes={types}
            onEdit={handleEditLogClick}
            onDelete={handleDeleteLog}
          />
        </div>
        <div className="space-y-6">
          <CommuteSummary logs={sortedLogs} commuteTypes={types} />
          <CommutePredictor logs={sortedLogs} commuteTypes={types} />
        </div>
      </main>

      <AddEditLogDialog
        isOpen={isAddEditDialogOpen}
        onOpenChange={setAddEditDialogOpen}
        onSave={handleSaveLog}
        log={editingLog}
        commuteTypes={types}
      />

      <ManageTypesDialog
        isOpen={isManageTypesOpen}
        onOpenchange={setManageTypesOpen}
        commuteTypes={types}
        setCommuteTypes={handleSaveTypes}
      />
    </div>
  );
}
