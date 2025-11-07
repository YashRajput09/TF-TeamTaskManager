import React, { useState } from "react";
import { Brain, Users, BarChart3 } from "lucide-react";
import GroupSelector from "./GroupSelector";
import WorkloadAnalysis from "./WorkloadAnalysis";
import AutoRedistribution from "./AutoRedistribution";

export default function AIAutomationDashboard() {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [activeTab, setActiveTab] = useState("analysis");

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-3">
          <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Task Management
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Intelligent workload analysis and automatic task redistribution
          powered by AI
        </p>
      </div>

      {/* Group Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <GroupSelector
          onGroupSelect={setSelectedGroup}
          selectedGroup={selectedGroup}
        />
      </div>

      {selectedGroup && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("analysis")}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "analysis"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Workload Analysis</span>
              </button>
              <button
                onClick={() => setActiveTab("redistribution")}
                className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === "redistribution"
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Auto Redistribution</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "analysis" && (
              <WorkloadAnalysis
                groupId={selectedGroup.id}
                groupName={selectedGroup.name}
              />
            )}
            {activeTab === "redistribution" && (
              <AutoRedistribution
                groupId={selectedGroup.id}
                groupName={selectedGroup.name}
              />
            )}
          </div>
        </div>
      )}

      {!selectedGroup && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Select a Group
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Choose a group from the dropdown above to view workload analysis and
            automate task redistribution.
          </p>
        </div>
      )}
    </div>
  );
}