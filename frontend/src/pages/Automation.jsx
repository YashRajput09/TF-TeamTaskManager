//Automation.jsx
import React, { use, useState } from "react";
import Card from "../components/Card";
import {
  Brain,
  RefreshCw,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import axiosInstance from "./utility/axiosInstance";
// import ToggleAnalyzeResults from "../components/ToggleAnalyzeResults";
import SmallToggle from "../components/SmallToggle";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Automation = ({ profile }) => {
  const [analysis, setAnalysis] = useState(null);
  const [userGroups, setUserGroups] = useState(profile.groups);
  const [loading, setLoading] = useState(false);
  const [redistributing, setRedistributing] = useState(false);
  const [mode, setMode] = useState("analyze");

  const navigate = useNavigate();
  useEffect(() => {
    if (mode === "analyze") {
      setAnalysis(null);
    }
    // mode === "analyze" ? setAnalysis(null) : setAnalysis();
  }, [mode]);

  useEffect(() => {
    analysis === null ? setMode("analyze") : setMode("results");
  }, [analysis]);

  const analyzeWorkload = async (groupId) => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        `/automation/groups/${groupId}/workload-analysis`
        //    {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}`
        //   }
        // }
      );

      setMode("results");
      setAnalysis(data);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };


  const autoRedistribute = async (groupId) => {
    setRedistributing(true);
    try {
      const { data } = await axiosInstance.post(
        `/automation/groups/${groupId}/auto-redistribute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            minTasksPerUser: 2,
            maxTasksPerUser: 4,
          }),
        }
      );
      
      // alert(`Redistribution completed: ${data.message}`);
      toast.success(`Redistribution completed: ${data.message}`)
      navigate("/dashboard");
    } catch (error) {
      console.error("Redistribution failed:", error);
    } finally {
      setRedistributing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Automation
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Smart workload analysis and automatic task redistribution
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Analysis Card */}
        <Card>
          <div className="flex w-full flex-col md:flex-row items-start p-0 md:items-center justify-between space-x-1 ">
            <div className="flex gap-2 items-center">
              <Brain className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Workload Analysis
              </h2>
            </div>

            <div className="p-2 ml-auto">
              <SmallToggle value={mode} onChange={setMode} />
            </div>
          </div>

          {/* <p className="text-gray-600 dark:text-gray-400 mb-2  ">
            Analyze team workload distribution and get AI-powered insights
          </p> */}

          {!analysis && (
            <>
              <button
                onClick={() => analyzeWorkload("your-group-id-here")}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                <span>
                  {loading ? "Analyzing..." : "Run Workload Analysis"}
                </span>
              </button>

              {/* //dummy data  */}
              <div className="space-y-1 ">
                {userGroups &&
                  userGroups
                  ?.filter(group => group.createdBy === profile?._id)
                  ?.map((group) => (
                    <div
                      key={group._id}
                      className="w-full text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                
                      <div className="flex items-center justify-between">
                       
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg`} />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {group?.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {group?.members?.length} members • 3 active
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {/* <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full ${t.color}`}
                          style={{ width: `${t.progress}%` }}
                        />
                      </div> */}
                            <span className="text-xs ml-auto font-medium text-gray-700 dark:text-gray-300">
                              <button
                                onClick={() => analyzeWorkload(group?._id)}
                                className="bg-red-700/70 px-4 py-1 rounded-md"
                              >
                                Analyze
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* //Dummy data */}

          {analysis && (
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Analysis Results
              </h3>

              {/* AI Insights */}
              {analysis.aiInsights && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    AI Insights
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {analysis.aiInsights.recommendations?.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* User Workloads */}
              <div className="space-y-3">
                {analysis?.analysis?.users?.map((user) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.name ? user.name : "User"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === "overloaded"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : user.status === "balanced"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}
                      >
                        {user.status}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Score: {user.workloadScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
             {/* { console.log("analysis")}
             { console.log(analysis?.groupId)} */}
              {/* Auto Redistribute Button */}
              <button
                onClick={() => autoRedistribute(analysis.groupId)}
                disabled={redistributing}
                className="btn-secondary w-full flex items-center justify-center space-x-2 mt-4"
              >
                {redistributing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>
                  {redistributing
                    ? "Redistributing..."
                    : "Auto Redistribute Tasks"}
                </span>
              </button>
            </div>
          )}
        </Card>

        {/* Statistics Card */}
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Automation Stats
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  AI Analysis Runs
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                24
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 text-blue-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Tasks Redistributed
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                156
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Bottlenecks Resolved
                </span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                42
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Success Rate
                </span>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">
                94%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Automation;
