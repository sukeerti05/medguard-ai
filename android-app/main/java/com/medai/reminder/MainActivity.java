public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Example: BP tablet at 8:00 AM
        AlarmScheduler.scheduleAlarm(
                this,
                8,
                0,
                "BP medicine"
        );
    }
}
