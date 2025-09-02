export interface IReports<I, O> {
  process(input: I): Promise<O>;
}