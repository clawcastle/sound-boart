interface IActivityListener<T> {
  onActivity: (activity: T) => Promise<void>;
}

export default IActivityListener;
