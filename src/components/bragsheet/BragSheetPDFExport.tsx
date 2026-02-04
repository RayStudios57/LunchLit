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

  const loadImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  const generateFancyPDF = async (doc: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Enhanced color palette
    const primaryColor = [79, 70, 229]; // Indigo
    const primaryLight = [129, 140, 248]; // Indigo light
    const accentColor = [16, 185, 129]; // Emerald
    const warmAccent = [251, 146, 60]; // Orange
    const textDark = [15, 23, 42]; // Slate 900
    const textMuted = [71, 85, 105]; // Slate 600
    const bgLight = [248, 250, 252]; // Slate 50
    const bgCard = [241, 245, 249]; // Slate 100

    const checkNewPage = (neededHeight: number) => {
      if (yPos + neededHeight > pageHeight - margin - 15) {
        // Add page number before new page
        addPageFooter();
        doc.addPage();
        yPos = margin + 5;
        return true;
      }
      return false;
    };

    const addPageFooter = () => {
      const pageNum = doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(`Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    };

    const drawSectionHeader = (title: string, icon?: string) => {
      checkNewPage(18);
      
      // Gradient-like effect with two rectangles
      doc.setFillColor(...primaryColor);
      doc.roundedRect(margin, yPos - 2, contentWidth, 12, 2, 2, 'F');
      doc.setFillColor(...primaryLight);
      doc.roundedRect(margin + contentWidth - 40, yPos - 2, 40, 12, 2, 2, 'F');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(icon ? `${icon}  ${title}` : title, margin + 6, yPos + 6);
      doc.setTextColor(0, 0, 0);
      yPos += 18;
    };

    const drawDivider = () => {
      doc.setDrawColor(...bgCard);
      doc.setLineWidth(0.5);
      doc.line(margin + 10, yPos, pageWidth - margin - 10, yPos);
      yPos += 6;
    };

    // ========== HEADER ==========
    // Gradient header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 42, 'F');
    doc.setFillColor(...primaryLight);
    doc.rect(pageWidth - 60, 0, 60, 42, 'F');
    
    // Decorative accent bar
    doc.setFillColor(...accentColor);
    doc.rect(0, 42, pageWidth, 3, 'F');

    // Title
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Student Brag Sheet', margin, 26);
    
    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 255);
    doc.text('Academic & Extracurricular Portfolio', margin, 36);
    
    doc.setTextColor(0);
    yPos = 55;

    // ========== STUDENT INFO CARD ==========
    doc.setFillColor(...bgLight);
    doc.roundedRect(margin, yPos, contentWidth, 32, 4, 4, 'F');
    
    // Left accent bar
    doc.setFillColor(...primaryColor);
    doc.roundedRect(margin, yPos, 4, 32, 2, 2, 'F');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textDark);
    if (profile?.full_name) {
      doc.text(profile.full_name, margin + 14, yPos + 13);
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    let infoLine = [];
    if (profile?.school_name) infoLine.push(profile.school_name);
    if (profile?.grade_level) infoLine.push(`Grade ${profile.grade_level}`);
    if (infoLine.length > 0) {
      doc.text(infoLine.join('  •  '), margin + 14, yPos + 23);
    }

    // Date badge on right
    doc.setFillColor(...primaryLight);
    doc.roundedRect(pageWidth - margin - 50, yPos + 10, 46, 14, 3, 3, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(format(new Date(), 'MMM d, yyyy'), pageWidth - margin - 27, yPos + 19, { align: 'center' });
    
    doc.setTextColor(0);
    yPos += 42;

    // ========== QUICK STATS ==========
    const totalHours = entries.reduce((sum, e) => sum + (e.hours_spent || 0), 0);
    const verifiedCount = entries.filter(e => e.verification_status === 'verified').length;
    const yearsActive = Object.keys(entriesByYear).length;
    
    const statsWidth = (contentWidth - 12) / 4;
    const stats = [
      { label: 'Activities', value: entries.length.toString(), color: primaryColor },
      { label: 'Verified', value: verifiedCount.toString(), color: accentColor },
      { label: 'Hours', value: totalHours.toString(), color: warmAccent },
      { label: 'Years', value: yearsActive.toString(), color: primaryLight },
    ];

    stats.forEach((stat, i) => {
      const x = margin + i * (statsWidth + 4);
      doc.setFillColor(...stat.color);
      doc.roundedRect(x, yPos, statsWidth, 22, 3, 3, 'F');
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(stat.value, x + statsWidth / 2, yPos + 10, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + statsWidth / 2, yPos + 17, { align: 'center' });
    });
    
    doc.setTextColor(0);
    yPos += 32;

    // ========== ACADEMICS SECTION ==========
    if (academics) {
      drawSectionHeader('ACADEMIC PROFILE', '📚');

      // GPA Card
      if (academics.gpa_weighted || academics.gpa_unweighted) {
        doc.setFillColor(...bgCard);
        doc.roundedRect(margin, yPos, contentWidth / 2 - 4, 28, 3, 3, 'F');
        
        doc.setFillColor(...accentColor);
        doc.roundedRect(margin, yPos, 3, 28, 1, 1, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textMuted);
        doc.text('GRADE POINT AVERAGE', margin + 10, yPos + 8);
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        const gpaText = [];
        if (academics.gpa_unweighted) gpaText.push(`${academics.gpa_unweighted} UW`);
        if (academics.gpa_weighted) gpaText.push(`${academics.gpa_weighted} W`);
        doc.text(gpaText.join('  /  '), margin + 10, yPos + 20);
        yPos += 34;
      }

      // Test scores
      if (academics.test_scores && academics.test_scores.length > 0) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TEST SCORES', margin, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.setFontSize(10);
        for (const score of academics.test_scores) {
          const scoreText = score.subject 
            ? `${score.type} ${score.subject}: ${score.score}`
            : `${score.type}: ${score.score}`;
          doc.text(`▸ ${scoreText}`, margin + 4, yPos);
          yPos += 5;
        }
        yPos += 4;
      }

      // Courses
      if (academics.courses && academics.courses.length > 0) {
        checkNewPage(25);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('COURSEWORK', margin, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.setFontSize(10);
        for (const course of academics.courses) {
          const courseText = course.teacher 
            ? `${course.name} — ${course.teacher}`
            : course.name;
          doc.text(`▸ ${courseText}`, margin + 4, yPos);
          yPos += 5;
        }
        yPos += 4;
      }

      // Colleges
      if (academics.colleges_applying && academics.colleges_applying.length > 0) {
        checkNewPage(20);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text('TARGET COLLEGES', margin, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        doc.setFontSize(10);
        const collegesText = academics.colleges_applying.join('  •  ');
        const collegeLines = doc.splitTextToSize(collegesText, contentWidth - 8);
        doc.text(collegeLines, margin + 4, yPos);
        yPos += collegeLines.length * 5 + 4;
      }

      yPos += 6;
    }

    // ========== ACTIVITIES BY CATEGORY ==========
    const categoryOrder: BragCategory[] = ['leadership', 'extracurricular', 'club', 'volunteering', 'job', 'internship', 'award', 'academic', 'other'];
    const categoryIcons: Record<BragCategory, string> = {
      leadership: '👑',
      extracurricular: '⚽',
      club: '🎭',
      volunteering: '❤️',
      job: '💼',
      internship: '🎯',
      award: '🏆',
      academic: '📖',
      other: '✨',
    };
    
    const entriesByCategory = entries.reduce((acc, entry) => {
      if (!acc[entry.category]) acc[entry.category] = [];
      acc[entry.category].push(entry);
      return acc;
    }, {} as Record<BragCategory, BragSheetEntry[]>);

    for (const category of categoryOrder) {
      const categoryEntries = entriesByCategory[category];
      if (!categoryEntries || categoryEntries.length === 0) continue;

      drawSectionHeader(categoryLabels[category].toUpperCase(), categoryIcons[category]);

      for (let entryIdx = 0; entryIdx < categoryEntries.length; entryIdx++) {
        const entry = categoryEntries[entryIdx];
        checkNewPage(45);

        // Entry card background
        doc.setFillColor(...bgLight);
        doc.roundedRect(margin, yPos - 2, contentWidth, 8, 2, 2, 'F');

        // Title with verification badge
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...textDark);
        
        let titleX = margin + 4;
        doc.text(entry.title, titleX, yPos + 4);
        
        if (entry.verification_status === 'verified') {
          const titleWidth = doc.getTextWidth(entry.title);
          doc.setFillColor(...accentColor);
          doc.circle(titleX + titleWidth + 6, yPos + 2, 3, 'F');
          doc.setFontSize(6);
          doc.setTextColor(255, 255, 255);
          doc.text('✓', titleX + titleWidth + 4.5, yPos + 3.5);
        }

        // Meta info badge on right
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textMuted);
        const metaText = `${entry.grade_level} • ${entry.school_year}`;
        const metaWidth = doc.getTextWidth(metaText);
        doc.text(metaText, pageWidth - margin - metaWidth - 4, yPos + 4);
        yPos += 10;

        doc.setTextColor(...textDark);

        // Position/Role with accent
        if (entry.position_role) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...primaryColor);
          doc.text(entry.position_role, margin + 8, yPos);
          doc.setTextColor(0);
          yPos += 6;
        }

        // Grades & Hours in a compact format
        const detailParts = [];
        if (entry.grades_participated && entry.grades_participated.length > 0) {
          detailParts.push(`Grades ${entry.grades_participated.join(', ')}`);
        }
        if (entry.hours_spent) {
          detailParts.push(`${entry.hours_spent} hours`);
        }
        if (detailParts.length > 0) {
          doc.setFontSize(9);
          doc.setTextColor(...textMuted);
          doc.text(detailParts.join('  •  '), margin + 8, yPos);
          yPos += 5;
        }

        doc.setTextColor(...textDark);

        // Description
        if (entry.description) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const descLines = doc.splitTextToSize(entry.description, contentWidth - 16);
          checkNewPage(descLines.length * 4 + 8);
          doc.text(descLines, margin + 8, yPos);
          yPos += descLines.length * 4 + 3;
        }

        // Impact with special styling
        if (entry.impact) {
          doc.setFillColor(236, 253, 245); // Emerald 50
          const impactLines = doc.splitTextToSize(`Impact: ${entry.impact}`, contentWidth - 20);
          const impactHeight = impactLines.length * 4 + 6;
          checkNewPage(impactHeight + 5);
          
          doc.roundedRect(margin + 4, yPos - 2, contentWidth - 8, impactHeight, 2, 2, 'F');
          doc.setFillColor(...accentColor);
          doc.roundedRect(margin + 4, yPos - 2, 2, impactHeight, 1, 1, 'F');
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(...accentColor);
          doc.text(impactLines, margin + 12, yPos + 3);
          doc.setTextColor(0);
          yPos += impactHeight + 3;
        }

        // Images
        if (entry.images && entry.images.length > 0) {
          checkNewPage(45);
          const maxImages = Math.min(entry.images.length, 3);
          const imgWidth = (contentWidth - 16 - (maxImages - 1) * 4) / maxImages;
          const imgHeight = 35;
          
          for (let i = 0; i < maxImages; i++) {
            const imgUrl = entry.images[i];
            const base64 = await loadImageAsBase64(imgUrl);
            if (base64) {
              const x = margin + 8 + i * (imgWidth + 4);
              try {
                doc.addImage(base64, 'JPEG', x, yPos, imgWidth, imgHeight, undefined, 'MEDIUM');
                // Add subtle border
                doc.setDrawColor(...bgCard);
                doc.setLineWidth(0.5);
                doc.roundedRect(x, yPos, imgWidth, imgHeight, 2, 2, 'S');
              } catch (e) {
                // Skip if image can't be added
              }
            }
          }
          
          if (entry.images.length > 3) {
            doc.setFontSize(8);
            doc.setTextColor(...textMuted);
            doc.text(`+${entry.images.length - 3} more`, pageWidth - margin - 20, yPos + imgHeight - 2);
          }
          
          yPos += imgHeight + 6;
        }

        // Divider between entries (except last)
        if (entryIdx < categoryEntries.length - 1) {
          drawDivider();
        } else {
          yPos += 4;
        }
      }

      yPos += 6;
    }

    // ========== INSIGHT QUESTIONS ==========
    const answeredInsights = INSIGHT_QUESTIONS.filter(q => getInsightAnswer(q.key));
    if (answeredInsights.length > 0) {
      drawSectionHeader('PERSONAL INSIGHTS', '💭');

      for (const question of answeredInsights) {
        const answer = getInsightAnswer(question.key);
        if (!answer) continue;

        checkNewPage(35);

        // Question with styled background
        doc.setFillColor(...bgCard);
        const qLines = doc.splitTextToSize(question.question, contentWidth - 16);
        const qHeight = qLines.length * 5 + 6;
        doc.roundedRect(margin, yPos - 2, contentWidth, qHeight, 2, 2, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...primaryColor);
        doc.text(qLines, margin + 8, yPos + 4);
        yPos += qHeight + 4;

        // Answer
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...textDark);
        const aLines = doc.splitTextToSize(answer, contentWidth - 12);
        checkNewPage(aLines.length * 4 + 8);
        doc.text(aLines, margin + 8, yPos);
        yPos += aLines.length * 4 + 10;
      }
    }

    // ========== FINAL FOOTER ==========
    addPageFooter();
    
    // Add footer bar on last page
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
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
