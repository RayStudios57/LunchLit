import { Button } from '@/components/ui/button';
import { FileDown, Loader2, FileText, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BragSheetEntry, BragCategory } from '@/hooks/useBragSheet';
import { Profile } from '@/hooks/useProfile';
import { BragSheetAcademics } from '@/hooks/useBragSheetAcademics';
import { BragSheetInsight, INSIGHT_QUESTIONS } from '@/hooks/useBragSheetInsights';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BragSheetPDFExportProps {
  entries: BragSheetEntry[];
  entriesByYear: Record<string, BragSheetEntry[]>;
  profile: Profile | null;
  academics?: BragSheetAcademics | null;
  insights?: BragSheetInsight[];
}

type ExportStyle = 'raw' | 'fancy';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const getInsightAnswer = (key: string) => {
    return insights.find(i => i.question_key === key)?.answer || '';
  };

  const generatePDF = async (style: ExportStyle) => {
    setIsGenerating(true);
    setIsDialogOpen(false);
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      if (style === 'raw') {
        await generateRawPDF(doc);
      } else {
        await generateFancyPDF(doc);
      }

      const fileName = profile?.full_name 
        ? `${profile.full_name.replace(/\s+/g, '_')}_Brag_Sheet${style === 'fancy' ? '_Professional' : ''}.pdf`
        : `Brag_Sheet${style === 'fancy' ? '_Professional' : ''}.pdf`;
      doc.save(fileName);

      toast({
        title: 'PDF exported successfully!',
        description: `Your ${style === 'fancy' ? 'professional' : 'plain text'} brag sheet has been downloaded.`,
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

  const generateRawPDF = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // Simple header
    doc.setFontSize(16);
    doc.setFont('courier', 'bold');
    doc.text('BRAG SHEET', margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    if (profile?.full_name) {
      doc.text(`Name: ${profile.full_name}`, margin, yPos);
      yPos += 5;
    }
    if (profile?.school_name) {
      doc.text(`School: ${profile.school_name}`, margin, yPos);
      yPos += 5;
    }
    if (profile?.grade_level) {
      doc.text(`Grade: ${profile.grade_level}`, margin, yPos);
      yPos += 5;
    }
    doc.text(`Date: ${format(new Date(), 'MM/dd/yyyy')}`, margin, yPos);
    yPos += 10;

    // Separator
    doc.text('='.repeat(60), margin, yPos);
    yPos += 8;

    // Academics
    if (academics) {
      doc.setFont('courier', 'bold');
      doc.text('ACADEMICS', margin, yPos);
      yPos += 6;
      doc.setFont('courier', 'normal');

      if (academics.gpa_unweighted) {
        doc.text(`GPA (Unweighted): ${academics.gpa_unweighted}`, margin, yPos);
        yPos += 5;
      }
      if (academics.gpa_weighted) {
        doc.text(`GPA (Weighted): ${academics.gpa_weighted}`, margin, yPos);
        yPos += 5;
      }

      if (academics.test_scores && academics.test_scores.length > 0) {
        doc.text('Test Scores:', margin, yPos);
        yPos += 5;
        for (const score of academics.test_scores) {
          const scoreText = score.subject 
            ? `  - ${score.type} ${score.subject}: ${score.score}`
            : `  - ${score.type}: ${score.score}`;
          doc.text(scoreText, margin, yPos);
          yPos += 4;
        }
      }

      if (academics.courses && academics.courses.length > 0) {
        checkNewPage(15);
        doc.text('Courses:', margin, yPos);
        yPos += 5;
        for (const course of academics.courses) {
          const courseText = course.teacher 
            ? `  - ${course.name} (${course.teacher})`
            : `  - ${course.name}`;
          doc.text(courseText, margin, yPos);
          yPos += 4;
        }
      }

      if (academics.colleges_applying && academics.colleges_applying.length > 0) {
        checkNewPage(10);
        doc.text(`Colleges: ${academics.colleges_applying.join(', ')}`, margin, yPos);
        yPos += 5;
      }

      yPos += 5;
      doc.text('-'.repeat(60), margin, yPos);
      yPos += 8;
    }

    // Entries by category
    const categoryOrder: BragCategory[] = ['leadership', 'extracurricular', 'club', 'volunteering', 'job', 'internship', 'award', 'academic', 'other'];
    const entriesByCategory = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<BragCategory, BragSheetEntry[]>);

    for (const category of categoryOrder) {
      const categoryEntries = entriesByCategory[category];
      if (!categoryEntries || categoryEntries.length === 0) continue;

      checkNewPage(15);
      doc.setFont('courier', 'bold');
      doc.text(categoryLabels[category].toUpperCase(), margin, yPos);
      yPos += 6;
      doc.setFont('courier', 'normal');

      for (const entry of categoryEntries) {
        checkNewPage(20);

        doc.text(`* ${entry.title}`, margin, yPos);
        yPos += 5;

        if (entry.position_role) {
          doc.text(`  Role: ${entry.position_role}`, margin, yPos);
          yPos += 4;
        }

        doc.text(`  Grade: ${entry.grade_level} | Year: ${entry.school_year}`, margin, yPos);
        yPos += 4;

        if (entry.grades_participated && entry.grades_participated.length > 0) {
          doc.text(`  Participated: ${entry.grades_participated.join(', ')}`, margin, yPos);
          yPos += 4;
        }

        if (entry.hours_spent) {
          doc.text(`  Hours: ${entry.hours_spent}`, margin, yPos);
          yPos += 4;
        }

        if (entry.description) {
          const descLines = doc.splitTextToSize(`  ${entry.description}`, contentWidth - 4);
          checkNewPage(descLines.length * 4);
          doc.text(descLines, margin, yPos);
          yPos += descLines.length * 4;
        }

        if (entry.impact) {
          const impactLines = doc.splitTextToSize(`  Impact: ${entry.impact}`, contentWidth - 4);
          checkNewPage(impactLines.length * 4);
          doc.text(impactLines, margin, yPos);
          yPos += impactLines.length * 4;
        }

        yPos += 3;
      }

      yPos += 5;
    }

    // Insight questions
    const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
    if (answeredInsights.length > 0) {
      checkNewPage(20);
      doc.text('-'.repeat(60), margin, yPos);
      yPos += 8;

      doc.setFont('courier', 'bold');
      doc.text('INSIGHT QUESTIONS', margin, yPos);
      yPos += 8;

      for (const question of answeredInsights) {
        const answer = getInsightAnswer(question.key);
        if (!answer) continue;

        checkNewPage(25);
        doc.setFont('courier', 'bold');
        const qLines = doc.splitTextToSize(`Q: ${question.question}`, contentWidth);
        doc.text(qLines, margin, yPos);
        yPos += qLines.length * 4 + 2;

        doc.setFont('courier', 'normal');
        const aLines = doc.splitTextToSize(`A: ${answer}`, contentWidth);
        checkNewPage(aLines.length * 4);
        doc.text(aLines, margin, yPos);
        yPos += aLines.length * 4 + 6;
      }
    }

    // Summary
    checkNewPage(30);
    doc.text('='.repeat(60), margin, yPos);
    yPos += 8;
    doc.setFont('courier', 'bold');
    doc.text('SUMMARY', margin, yPos);
    yPos += 6;
    doc.setFont('courier', 'normal');

    const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
    const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;

    doc.text(`Total Activities: ${entries.length}`, margin, yPos);
    yPos += 5;
    doc.text(`Verified: ${verifiedCount}`, margin, yPos);
    yPos += 5;
    doc.text(`Total Hours: ${totalHours}`, margin, yPos);
  };

  const generateFancyPDF = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const primaryColor = [59, 130, 246]; // Blue
    const secondaryColor = [100, 116, 139]; // Slate

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    const drawSectionHeader = (title: string) => {
      checkNewPage(15);
      doc.setFillColor(...primaryColor);
      doc.rect(margin, yPos - 3, contentWidth, 10, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin + 4, yPos + 4);
      doc.setTextColor(0, 0, 0);
      yPos += 14;
    };

    // Header with decorative line
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Student Brag Sheet', margin, 23);
    doc.setTextColor(0);
    yPos = 45;

    // Student info card
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, 30, 3, 3, 'F');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    if (profile?.full_name) {
      doc.text(profile.full_name, margin + 8, yPos + 12);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...secondaryColor);
    let infoLine = [];
    if (profile?.school_name) infoLine.push(profile.school_name);
    if (profile?.grade_level) infoLine.push(profile.grade_level);
    if (infoLine.length > 0) {
      doc.text(infoLine.join(' • '), margin + 8, yPos + 20);
    }

    doc.setFontSize(9);
    doc.text(`Generated ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth - margin - 45, yPos + 20);
    doc.setTextColor(0);
    yPos += 40;

    // Academics Section
    if (academics) {
      drawSectionHeader('ACADEMIC PROFILE');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // GPA in a nice box
      if (academics.gpa_weighted || academics.gpa_unweighted) {
        doc.setFillColor(240, 249, 255);
        doc.roundedRect(margin, yPos, contentWidth / 2 - 5, 20, 2, 2, 'F');
        
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('GPA', margin + 8, yPos + 8);
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        const gpaText = [];
        if (academics.gpa_unweighted) gpaText.push(`${academics.gpa_unweighted} UW`);
        if (academics.gpa_weighted) gpaText.push(`${academics.gpa_weighted} W`);
        doc.text(gpaText.join(' / '), margin + 8, yPos + 15);
        yPos += 25;
      }

      // Test scores
      if (academics.test_scores && academics.test_scores.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...secondaryColor);
        doc.text('Test Scores', margin, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        for (const score of academics.test_scores) {
          const scoreText = score.subject 
            ? `${score.type} ${score.subject}: ${score.score}`
            : `${score.type}: ${score.score}`;
          doc.text(`• ${scoreText}`, margin + 4, yPos);
          yPos += 5;
        }
        yPos += 3;
      }

      // Courses
      if (academics.courses && academics.courses.length > 0) {
        checkNewPage(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...secondaryColor);
        doc.text('Courses', margin, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        for (const course of academics.courses) {
          const courseText = course.teacher 
            ? `${course.name} — ${course.teacher}`
            : course.name;
          doc.text(`• ${courseText}`, margin + 4, yPos);
          yPos += 5;
        }
        yPos += 3;
      }

      // Colleges
      if (academics.colleges_applying && academics.colleges_applying.length > 0) {
        checkNewPage(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...secondaryColor);
        doc.text('Colleges of Interest', margin, yPos);
        yPos += 6;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        const collegesText = academics.colleges_applying.join(', ');
        const collegeLines = doc.splitTextToSize(collegesText, contentWidth - 8);
        doc.text(collegeLines, margin + 4, yPos);
        yPos += collegeLines.length * 5;
      }

      yPos += 8;
    }

    // Activities by category
    const categoryOrder: BragCategory[] = ['leadership', 'extracurricular', 'club', 'volunteering', 'job', 'internship', 'award', 'academic', 'other'];
    const entriesByCategory = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<BragCategory, BragSheetEntry[]>);

    for (const category of categoryOrder) {
      const categoryEntries = entriesByCategory[category];
      if (!categoryEntries || categoryEntries.length === 0) continue;

      drawSectionHeader(categoryLabels[category].toUpperCase());

      for (const entry of categoryEntries) {
        checkNewPage(30);

        // Entry card
        doc.setFillColor(250, 250, 250);
        doc.roundedRect(margin, yPos, contentWidth, 5, 1, 1, 'F');

        // Title and verification badge
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        
        let titleText = entry.title;
        if (entry.verification_status === 'verified') {
          titleText += ' ✓';
          doc.setTextColor(34, 197, 94); // Green for verified
        }
        doc.text(titleText, margin, yPos + 4);

        // Meta info on right
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...secondaryColor);
        const metaText = `${entry.grade_level} | ${entry.school_year}`;
        const metaWidth = doc.getTextWidth(metaText);
        doc.text(metaText, pageWidth - margin - metaWidth, yPos + 4);
        yPos += 8;

        doc.setTextColor(0);

        // Position/Role
        if (entry.position_role) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...primaryColor);
          doc.text(entry.position_role, margin + 4, yPos);
          doc.setTextColor(0);
          yPos += 5;
        }

        // Grades participated
        if (entry.grades_participated && entry.grades_participated.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(...secondaryColor);
          doc.text(`Grades: ${entry.grades_participated.join(', ')}`, margin + 4, yPos);
          yPos += 5;
        }

        // Hours
        if (entry.hours_spent) {
          doc.setFontSize(9);
          doc.setTextColor(...secondaryColor);
          doc.text(`${entry.hours_spent} hours`, margin + 4, yPos);
          yPos += 5;
        }

        doc.setTextColor(0);

        // Description
        if (entry.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(entry.description, contentWidth - 8);
          checkNewPage(descLines.length * 4 + 5);
          doc.text(descLines, margin + 4, yPos);
          yPos += descLines.length * 4 + 2;
        }

        // Impact
        if (entry.impact) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(34, 197, 94);
          const impactLines = doc.splitTextToSize(`Impact: ${entry.impact}`, contentWidth - 8);
          checkNewPage(impactLines.length * 4 + 5);
          doc.text(impactLines, margin + 4, yPos);
          doc.setTextColor(0);
          yPos += impactLines.length * 4 + 2;
        }

        yPos += 6;
      }

      yPos += 4;
    }

    // Insight Questions
    const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
    if (answeredInsights.length > 0) {
      drawSectionHeader('PERSONAL INSIGHTS');

      for (const question of answeredInsights) {
        const answer = getInsightAnswer(question.key);
        if (!answer) continue;

        checkNewPage(30);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        const qLines = doc.splitTextToSize(question.question, contentWidth);
        doc.text(qLines, margin, yPos);
        yPos += qLines.length * 5 + 3;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0);
        const aLines = doc.splitTextToSize(answer, contentWidth - 4);
        checkNewPage(aLines.length * 4 + 5);
        doc.text(aLines, margin + 4, yPos);
        yPos += aLines.length * 4 + 8;
      }
    }

    // Summary footer
    checkNewPage(50);
    yPos += 10;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Summary', margin + 8, yPos + 10);

    const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
    const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;
    const yearsActive = Object.keys(entriesByYear).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    const col1X = margin + 8;
    const col2X = margin + contentWidth / 2;
    
    doc.text(`Total Activities: ${entries.length}`, col1X, yPos + 20);
    doc.text(`Verified Entries: ${verifiedCount}`, col2X, yPos + 20);
    doc.text(`Total Hours: ${totalHours}`, col1X, yPos + 28);
    doc.text(`Years of Activity: ${yearsActive}`, col2X, yPos + 28);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
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
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Export Style</DialogTitle>
          <DialogDescription>
            Select how you'd like your Brag Sheet formatted
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => generatePDF('raw')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5" />
                Raw Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Plain, minimal formatting. Easy to read and copy/paste. Great for quick reference.
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => generatePDF('fancy')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-5 w-5" />
                Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Clean, professional layout designed for teachers and counselors. Print-friendly with polished formatting.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
