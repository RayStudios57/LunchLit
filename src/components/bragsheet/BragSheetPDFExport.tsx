import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BragSheetEntry, BragCategory } from '@/hooks/useBragSheet';
import { Profile } from '@/hooks/useProfile';
import { BragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { BragSheetInsight, INSIGHT_QUESTIONS } from '@/hooks/useBragSheetInsights';
import { format } from 'date-fns';

interface BragSheetPDFExportProps {
  entries: BragSheetEntry[];
  entriesByYear: Record<string, BragSheetEntry[]>;
  profile: Profile | null;
  academics?: BragSheetAcademics | null;
  insights?: BragSheetInsight[];
}

const categoryLabels: Record<BragCategory, string> = {
  volunteering: 'Community Service',
  job: 'Work Experience',
  award: 'Honors & Awards',
  internship: 'Internship',
  leadership: 'Leadership',
  club: 'Clubs & Organizations',
  extracurricular: 'Extracurricular Activities',
  academic: 'Academic Achievement',
  other: 'Other Activities',
};

export function BragSheetPDFExport({ entries, entriesByYear, profile, academics, insights = [] }: BragSheetPDFExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getInsightAnswer = (key: string) => {
    return insights.find(i => i.question_key === key)?.answer || '';
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let yPos = margin;

      // Helper function to add new page if needed
      const checkNewPage = (neededHeight: number) => {
        if (yPos + neededHeight > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // Header
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Brag Sheet', margin, yPos);
      yPos += 10;

      // Student info
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      if (profile?.full_name) {
        doc.text(`Name: ${profile.full_name}`, margin, yPos);
        yPos += 6;
      }
      if (profile?.school_name) {
        doc.setFontSize(11);
        doc.text(`School: ${profile.school_name}`, margin, yPos);
        yPos += 5;
      }
      if (profile?.grade_level) {
        doc.text(`Grade: ${profile.grade_level}`, margin, yPos);
        yPos += 5;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy')}`, margin, yPos);
      doc.setTextColor(0);
      yPos += 12;

      // Divider
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      // ACADEMICS SECTION
      if (academics) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMICS', margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // GPA
        if (academics.gpa_weighted || academics.gpa_unweighted) {
          const gpaText = [];
          if (academics.gpa_unweighted) gpaText.push(`Unweighted: ${academics.gpa_unweighted}`);
          if (academics.gpa_weighted) gpaText.push(`Weighted: ${academics.gpa_weighted}`);
          doc.text(`GPA: ${gpaText.join(' | ')}`, margin, yPos);
          yPos += 5;
        }

        // Test Scores
        if (academics.test_scores && academics.test_scores.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.text('Test Scores:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          
          for (const score of academics.test_scores) {
            const scoreText = score.subject 
              ? `${score.type} ${score.subject}: ${score.score}`
              : `${score.type}: ${score.score}`;
            doc.text(`  • ${scoreText}`, margin, yPos);
            yPos += 4;
          }
          yPos += 2;
        }

        // Courses
        if (academics.courses && academics.courses.length > 0) {
          checkNewPage(20);
          doc.setFont('helvetica', 'bold');
          doc.text('Courses (with teacher):', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          
          for (const course of academics.courses) {
            const courseText = course.teacher 
              ? `${course.name} - ${course.teacher}`
              : course.name;
            doc.text(`  • ${courseText}`, margin, yPos);
            yPos += 4;
          }
          yPos += 2;
        }

        // Colleges
        if (academics.colleges_applying && academics.colleges_applying.length > 0) {
          checkNewPage(15);
          doc.setFont('helvetica', 'bold');
          doc.text('Colleges Applying To:', margin, yPos);
          yPos += 5;
          doc.setFont('helvetica', 'normal');
          const collegesText = academics.colleges_applying.join(', ');
          const collegeLines = doc.splitTextToSize(collegesText, contentWidth);
          doc.text(collegeLines, margin, yPos);
          yPos += collegeLines.length * 4 + 2;
        }

        yPos += 6;
        doc.setDrawColor(220);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      }

      // ACTIVITIES & ENTRIES BY CATEGORY
      // Group entries by category for better formatting
      const entriesByCategory = entries.reduce((acc, entry) => {
        if (!acc[entry.category]) acc[entry.category] = [];
        acc[entry.category].push(entry);
        return acc;
      }, {} as Record<BragCategory, BragSheetEntry[]>);

      // Category order for college applications
      const categoryOrder: BragCategory[] = [
        'leadership',
        'extracurricular',
        'club',
        'volunteering',
        'job',
        'internship',
        'award',
        'academic',
        'other',
      ];

      for (const category of categoryOrder) {
        const categoryEntries = entriesByCategory[category];
        if (!categoryEntries || categoryEntries.length === 0) continue;

        checkNewPage(20);

        // Category header
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text(categoryLabels[category].toUpperCase(), margin, yPos);
        yPos += 8;

        for (const entry of categoryEntries) {
          checkNewPage(25);

          // Entry title
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          
          const titleWithStatus = entry.verification_status === 'verified' 
            ? `${entry.title} ✓` 
            : entry.title;
          doc.text(titleWithStatus, margin, yPos);
          
          // Grade level and dates on the right
          const dateRange = entry.start_date 
            ? `${format(new Date(entry.start_date), 'MMM yyyy')}${entry.is_ongoing ? ' - Present' : entry.end_date ? ` - ${format(new Date(entry.end_date), 'MMM yyyy')}` : ''}`
            : '';
          const gradeInfo = `${entry.grade_level}${dateRange ? ' | ' + dateRange : ''}`;
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const gradeWidth = doc.getTextWidth(gradeInfo);
          doc.text(gradeInfo, pageWidth - margin - gradeWidth, yPos);
          yPos += 5;

          // Position/Role
          if (entry.position_role) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(`Role: ${entry.position_role}`, margin, yPos);
            yPos += 4;
          }

          // Grades Participated
          if (entry.grades_participated && entry.grades_participated.length > 0) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Grades: ${entry.grades_participated.join(', ')}`, margin, yPos);
            doc.setTextColor(0);
            yPos += 4;
          }

          // Year Received (for awards)
          if (entry.year_received) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`Year: ${entry.year_received}`, margin, yPos);
            doc.setTextColor(0);
            yPos += 4;
          }

          // Hours if applicable
          if (entry.hours_spent) {
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(`${entry.hours_spent} hours`, margin, yPos);
            doc.setTextColor(0);
            yPos += 4;
          }

          // Description
          if (entry.description) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const descLines = doc.splitTextToSize(entry.description, contentWidth);
            checkNewPage(descLines.length * 4 + 5);
            doc.text(descLines, margin, yPos);
            yPos += descLines.length * 4 + 2;
          }

          // Impact
          if (entry.impact) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            const impactLines = doc.splitTextToSize(`Impact: ${entry.impact}`, contentWidth);
            checkNewPage(impactLines.length * 4 + 5);
            doc.text(impactLines, margin, yPos);
            yPos += impactLines.length * 4 + 2;
          }

          yPos += 4;
        }

        yPos += 6;
      }

      // INSIGHT QUESTIONS SECTION
      const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
      if (answeredInsights.length > 0) {
        checkNewPage(30);
        yPos += 5;
        doc.setDrawColor(200);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;

        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.text('INSIGHT QUESTIONS', margin, yPos);
        yPos += 10;

        for (const question of answeredInsights) {
          const answer = getInsightAnswer(question.key);
          if (!answer) continue;

          checkNewPage(30);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const questionLines = doc.splitTextToSize(question.question, contentWidth);
          doc.text(questionLines, margin, yPos);
          yPos += questionLines.length * 4 + 3;

          doc.setFont('helvetica', 'normal');
          const answerLines = doc.splitTextToSize(answer, contentWidth);
          checkNewPage(answerLines.length * 4 + 5);
          doc.text(answerLines, margin, yPos);
          yPos += answerLines.length * 4 + 8;
        }
      }

      // Summary section
      checkNewPage(40);
      yPos += 5;
      doc.setDrawColor(200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY', margin, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
      const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;
      const yearsActive = Object.keys(entriesByYear).length;

      doc.text(`Total Activities: ${entries.length}`, margin, yPos);
      yPos += 5;
      doc.text(`Verified Entries: ${verifiedCount}`, margin, yPos);
      yPos += 5;
      doc.text(`Total Hours: ${totalHours}`, margin, yPos);
      yPos += 5;
      doc.text(`Years of Activity: ${yearsActive}`, margin, yPos);

      // Save the PDF
      const fileName = profile?.full_name 
        ? `${profile.full_name.replace(/\s+/g, '_')}_Brag_Sheet.pdf`
        : 'Brag_Sheet.pdf';
      doc.save(fileName);

      toast({
        title: 'PDF exported successfully!',
        description: 'Your brag sheet has been downloaded.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Error generating PDF',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      disabled={isGenerating || entries.length === 0}
      variant="outline"
      className="gap-2"
    >
      {isGenerating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      Export PDF
    </Button>
  );
}
