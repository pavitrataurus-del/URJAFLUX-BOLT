import { useState, useEffect } from "react";
import { knowledgeVerificationService, IFullVerificationRecord } from "../KnowledgeVerificationService";
import { KnowledgeStatus } from "../VerificationTypes";

export function useKnowledgeVerification(userRole: "ADMIN" | "END_USER" = "ADMIN") {
  const [records, setRecords] = useState<IFullVerificationRecord[]>([]);
  const [selectedRuleId, setSelectedRuleId] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const refreshRecords = () => {
    const list = knowledgeVerificationService.getAllRecords(userRole);
    setRecords(list);
    if (list.length > 0 && !selectedRuleId) {
      setSelectedRuleId(list[0].ruleId);
    }
  };

  useEffect(() => {
    refreshRecords();
  }, [userRole]);

  const selectedRecord = records.find(r => r.ruleId === selectedRuleId) || records[0];

  const filteredRecords = records.filter(r => {
    const matchesStatus = filterStatus === "ALL" || r.status === filterStatus;
    const matchesSearch = searchTerm === "" || 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.statement.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.domain.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const promoteToCanonical = (ruleId: string, reviewer: string, comment: string) => {
    knowledgeVerificationService.promoteRuleToCanonical(ruleId, reviewer, comment);
    refreshRecords();
  };

  const resolveContradiction = (
    ruleId: string,
    contradictionId: string,
    state: "CONSENSUS_REACHED" | "CONTEXT_DEPENDENT" | "SUPERSEDED",
    reviewer: string,
    notes: string
  ) => {
    knowledgeVerificationService.resolveContradiction(ruleId, contradictionId, state, reviewer, notes);
    refreshRecords();
  };

  return {
    records,
    filteredRecords,
    selectedRecord,
    selectedRuleId,
    setSelectedRuleId,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    refreshRecords,
    promoteToCanonical,
    resolveContradiction
  };
}
