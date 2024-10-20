type JobRunOptions = {
  runInBackground: boolean;
};

export abstract class Job {
  name: string;
  runOptions: JobRunOptions;

  constructor(name: string, runOptions: JobRunOptions) {
    this.name = name;
    this.runOptions = runOptions;
  }

  abstract run(): Promise<void>;
}

export class JobContext {
  private _jobs: Job[] = [];

  addJob(job: Job) {
    this._jobs.push(job);
  }

  async runJobs() {
    this._jobs.forEach(async (job) => {
      await this.runJob(job);
    });
  }

  private async runJob(job: Job): Promise<void> {
    console.log(`Running job '${job.name}'.`);

    if (job.runOptions.runInBackground) {
      job.run().then(() => console.log(`Finished running job '${job.name}'.`));
    } else {
      try {
        await job.run();
        console.log(`Finished running job '${job.name}'.`);
      } catch (e) {
        console.error(`Error in job ${job.name}.`, e);
      }
    }
  }
}
