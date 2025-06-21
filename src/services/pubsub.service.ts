import Ably from 'ably';

// const ably = new Ably.Realtime(process.env.ABLY_API_KEY!);

const ably = new Ably.Realtime('9WkYZw.d4bidg:PnuB78zqhK0lTnnBmMU89u9aPX7xPdLkTqTmNRA-bNc');

export function subscribeToChannel(channelName: string, callback: (message: any) => void) {
  return new Promise<void>((resolve, reject) => {
    const channel = ably.channels.get(channelName);
    channel.subscribe('sample-event', (message: any) => {
      callback(message);
    });
    // Ably's subscribe does not support an error callback; resolve immediately after subscribing
    resolve();
  });
}
export function publishMessages(channelName: string, event: string, message: string) {
  return new Promise<void>((resolve, reject) => {
    const channel = ably.channels.get(channelName);
    channel.publish(event, { message })
      .then(() => {
        resolve();
      })
      .catch((err: unknown) => {
        reject(err);
      });
  });
}