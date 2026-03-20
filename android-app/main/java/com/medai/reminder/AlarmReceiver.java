public class AlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {

        String medicineName = intent.getStringExtra("medicine");

        // 🔊 Loud alarm sound
        MediaPlayer mediaPlayer = MediaPlayer.create(
                context, 
                Settings.System.DEFAULT_ALARM_ALERT_URI
        );
        mediaPlayer.start();

        // 🗣️ Voice reminder
        TextToSpeech tts = new TextToSpeech(context, status -> {
            if (status == TextToSpeech.SUCCESS) {
                tts.speak(
                        "Please take your " + medicineName + " now",
                        TextToSpeech.QUEUE_FLUSH,
                        null,
                        null
                );
            }
        });
    }
}
