import { z } from "zod";

const skillExtractionJobSchema = z.object({
  id: z.string().min(1, "Invalid application ID"),
  jobId: z.string().min(1, "Invalid job ID"),
});

export { skillExtractionJobSchema };
