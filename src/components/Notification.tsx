

import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';


const createChannelId = async () => {
    const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        vibration: true,
        vibrationPattern: [300, 500],
    });

    return channelId
}


export const showNotification = async (date) => {
    await notifee.requestPermission()
    const channelId = await createChannelId() 

    await notifee.displayNotification({
        title: '<strong>Lembrete de revisão</strong>',
        body: `notificação`,
        android: { channelId },
    });
}




export const scheduleNotification = async () => {
    const channelId = await createChannelId() 
    const date = new Date(Date.now());
    
    date.setSeconds(date.getSeconds() + 3);

    // Create a time-based trigger
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(), // fire at 11:10am (10 minutes before meeting)
    };

    // Create a trigger notification
    await notifee.createTriggerNotification(
      {
        title: 'Lembrete de revisão ⚠️',
        body: 'Hoje é o dia para fazer o serviço novamente',
        android: {
            channelId,
            largeIcon: require('../assets/logoCommodusEscuro.png'),
            circularLargeIcon: true,
            smallIcon: 'ic_stat_name',
            color: '#1B2040'
        }
        

      },
      trigger,
    );
}