import React, { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { AppSubmission, AppAction } from "@/types";
import {
  CheckCircle,
  XCircle,
  Flag,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface AppRowProps {
  app: AppSubmission;
  onAction: (action: AppAction) => void;
  isLoading?: boolean;
}

export const AppRow = memo<AppRowProps>(({ app, onAction, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAction = (type: AppAction["type"]) => {
    onAction({
      type,
      appId: app.id,
      moderatorId: "current-user",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-800 bg-green-100";
      case "rejected":
        return "text-red-800 bg-red-100";
      case "flagged":
        return "text-yellow-800 bg-yellow-100";
      default:
        return "text-blue-800 bg-blue-100";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-8 w-8 hover:bg-gray-100"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </Button>
            <div>
              <div className="font-medium text-fanvue-dark">{app.name}</div>
              <div className="text-sm text-gray-500">v{app.version}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-fanvue-dark max-w-xs">
          <div className="truncate" title={app.description}>
            {app.description}
          </div>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              app.status,
            )}`}
          >
            {app.status}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {app.developer.name}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          {formatDate(app.submittedAt)}
        </td>
        <td className="px-6 py-4 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <span>{app.metadata.rating}/5.0</span>
            <span className="text-gray-400">•</span>
            <span>{app.metadata.downloads.toLocaleString()} downloads</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant={app.status === "approved" ? "success" : "outline"}
              onClick={() => handleAction("approve")}
              disabled={isLoading}
              className={
                app.status === "approved"
                  ? "opacity-100"
                  : "text-green-600 hover:text-green-700 border-green-500 hover:bg-green-50"
              }
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={app.status === "rejected" ? "destructive" : "outline"}
              onClick={() => handleAction("reject")}
              disabled={isLoading}
              className={
                app.status === "rejected"
                  ? "opacity-100"
                  : "text-red-600 hover:text-red-700 border-red-500 hover:bg-red-50"
              }
            >
              <XCircle className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("flag")}
              disabled={isLoading}
              className={
                app.status === "flagged"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-500"
                  : "text-yellow-600 hover:text-yellow-700 border-yellow-500 hover:bg-yellow-50"
              }
            >
              <Flag className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-0">
            <div className="bg-white border-l-4 border-fanvue-green mx-6 mb-4 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-fanvue-green rounded-full"></div>
                      <h4 className="font-semibold text-fanvue-dark text-lg">
                        App Details
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Full Description
                        </span>
                        <p className="text-sm text-fanvue-dark mt-1">
                          {app.description}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Category
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1">
                            {app.category}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Version
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1">
                            {app.version}
                          </p>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          File Size
                        </span>
                        <p className="text-sm text-fanvue-dark mt-1">
                          {app.metadata.fileSize} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-2 h-2 bg-fanvue-blue rounded-full"></div>
                      <h4 className="font-semibold text-fanvue-dark text-lg">
                        Developer & Statistics
                      </h4>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Developer
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1 font-medium">
                            {app.developer.name}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Email
                          </span>
                          <p className="text-sm text-fanvue-blue mt-1">
                            {app.developer.email}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Downloads
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1 font-semibold">
                            {app.metadata.downloads.toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Rating
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1 font-semibold">
                            {app.metadata.rating}/5.0 ⭐
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Submitted
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1">
                            {formatDate(app.submittedAt)}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Last Updated
                          </span>
                          <p className="text-sm text-fanvue-dark mt-1">
                            {formatDate(app.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

AppRow.displayName = "AppRow";
