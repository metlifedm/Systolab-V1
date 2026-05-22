class ReportFormatter {
  /**
   * Format report for API response
   */
  static formatForAPI(report) {
    return {
      auditId: report._id,
      websiteUrl: report.websiteUrl,
      executionTimestamp: report.executionTimestamp,
      executionDuration: report.executionDuration,
      auditMode: report.auditMode,
      
      summary: report.summary,
      
      scores: {
        overall: {
          score: report.scores.overall.score,
          level: report.scores.overall.level,
          label: this.getScoreLabel(report.scores.overall.level)
        },
        categories: {
          websiteHealth: {
            score: report.scores.websiteHealth.score,
            level: report.scores.websiteHealth.level,
            label: this.getScoreLabel(report.scores.websiteHealth.level)
          },
          mobileExperience: {
            score: report.scores.mobileExperience.score,
            level: report.scores.mobileExperience.level,
            label: this.getScoreLabel(report.scores.mobileExperience.level)
          },
          trustPresence: {
            score: report.scores.trustPresence.score,
            level: report.scores.trustPresence.level,
            label: this.getScoreLabel(report.scores.trustPresence.level)
          },
          visibilityStructure: {
            score: report.scores.visibilityStructure.score,
            level: report.scores.visibilityStructure.level,
            label: this.getScoreLabel(report.scores.visibilityStructure.level)
          }
        }
      },
      
      findings: this.formatFindings(report.findings),
      
      businessContext: report.businessContext,
      
      crawlStats: report.crawlStats,
      
      technicalNotes: report.technicalNotes,
      
      metadata: {
        pagesAnalyzed: report.crawlStats.pagesAnalyzed,
        signalsExtracted: report.signals.length,
        findingsCount: report.findings.length,
        criticalIssues: report.findings.filter(f => f.priority === 'critical').length,
        highPriorityIssues: report.findings.filter(f => f.priority === 'high').length
      }
    };
  }

  /**
   * Format findings for readability
   */
  static formatFindings(findings) {
    return findings.map(finding => ({
      priority: finding.priority,
      priorityLabel: this.getPriorityLabel(finding.priority),
      category: finding.category,
      categoryLabel: this.getCategoryLabel(finding.category),
      signal: finding.signal,
      impact: finding.operationalImpact,
      consequence: finding.businessConsequence,
      action: finding.actionGuidance
    }));
  }

  /**
   * Get human-readable score label
   */
  static getScoreLabel(level) {
    const labels = {
      excellent: 'Excellent',
      good: 'Good',
      needs_improvement: 'Needs Improvement',
      critical: 'Critical'
    };
    return labels[level] || 'Unknown';
  }

  /**
   * Get human-readable priority label
   */
  static getPriorityLabel(priority) {
    const labels = {
      critical: 'Critical',
      high: 'High Priority',
      medium: 'Medium Priority',
      low: 'Low Priority',
      info: 'Informational'
    };
    return labels[priority] || 'Unknown';
  }

  /**
   * Get human-readable category label
   */
  static getCategoryLabel(category) {
    const labels = {
      website_health: 'Website Health',
      mobile_experience: 'Mobile Experience',
      trust_presence: 'Trust Presence',
      visibility_structure: 'Visibility Structure'
    };
    return labels[category] || 'Unknown';
  }

  /**
   * Format report for PDF export (future enhancement)
   */
  static formatForPDF(report) {
    // Placeholder for future PDF generation
    return this.formatForAPI(report);
  }

  /**
   * Format report for white-label systems (future enhancement)
   */
  static formatForWhiteLabel(report, branding) {
    const formatted = this.formatForAPI(report);
    formatted.branding = branding;
    return formatted;
  }
}

module.exports = ReportFormatter;