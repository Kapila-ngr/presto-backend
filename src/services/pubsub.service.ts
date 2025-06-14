import Ably from 'ably';

// const ably = new Ably.Realtime(process.env.ABLY_API_KEY!);

const ably = new Ably.Realtime('9WkYZw.d4bidg:PnuB78zqhK0lTnnBmMU89u9aPX7xPdLkTqTmNRA-bNc');

export function subscribeToChannel(channelName: string, callback: (message: any) => void) {
  return new Promise<void>((resolve, reject) => {
    const channel = ably.channels.get(channelName);
    channel.subscribe('sample-event', (message: any) => {
      console.log(`Received message from channel "${channelName}":`, message);
      callback(message);
    });
    // Ably's subscribe does not support an error callback; resolve immediately after subscribing
    console.log(`Subscribed to channel "${channelName}" successfully.`);
    resolve();
  });
}
export function publishSampleMessage(channelName: string, event: string, message: string) {
  return new Promise<void>((resolve, reject) => {
    const channel = ably.channels.get(channelName);
    channel.publish( event, { text: message })
      .then(() => {
        console.log(`Message sent to channel "${channelName}": ${message}`);
        resolve();
      })
      .catch((err: unknown) => {
        console.error('Ably publish error:', err);
        reject(err);
      });
  });
}