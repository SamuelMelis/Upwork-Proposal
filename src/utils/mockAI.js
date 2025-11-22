export const mockGenerateProposal = async (jobBrief, onStatusUpdate) => {
  const steps = [
    "Analyzing job brief...",
    "Identifying job category...",
    "Scanning for keywords...",
    "Selecting best winning proposal...",
    "Matching portfolio items...",
    "Drafting cover letter..."
  ];

  for (const step of steps) {
    onStatusUpdate(step);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  return `Dear Hiring Manager,

I noticed your job posting for a "${jobBrief.slice(0, 30)}..." and I'm excited to submit my proposal.

Based on your requirements, I understand you are looking for a specialist who can deliver high-quality results. With my experience in similar projects, I am confident I can help you achieve your goals.

Here is why I am the best fit:
- Proven track record in this category.
- Quick turnaround time.
- Attention to detail.

I have attached relevant portfolio samples that match your project needs.

Looking forward to discussing this further.

Best regards,
[Your Name]`;
};
