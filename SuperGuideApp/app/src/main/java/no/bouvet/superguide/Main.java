package no.bouvet.superguide;

import android.app.Activity;
import android.content.Context;
import android.location.*;
import android.os.Bundle;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.TextView;

import com.firebase.client.DataSnapshot;
import com.firebase.client.Firebase;
import com.firebase.client.FirebaseError;
import com.firebase.client.ValueEventListener;

public class Main extends Activity {

    private Firebase firebase;
    private String SIMSerialNumber;
    private TextView textView;
    private LocationManager locationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        locationManager = (LocationManager) this.getSystemService(Context.LOCATION_SERVICE);
        TelephonyManager telephonyManager = (TelephonyManager) getBaseContext().getSystemService(Context.TELEPHONY_SERVICE);
        SIMSerialNumber = telephonyManager.getSimSerialNumber();

        Firebase.setAndroidContext(this);
        firebase = new Firebase("https://superguide.firebaseio.com/");

        firebase.child("BroadcastMessage").addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                Object value = snapshot.getValue();
                if (value != null) {
                    textView.setText(value.toString());
                } else {
                    textView.setText("<No message>");
                }
            }
            @Override public void onCancelled(FirebaseError error) { }
        });

        textView = (TextView)findViewById(R.id.Message);

        EditText editText = (EditText) findViewById(R.id.editText);
        editText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                boolean handled = false;
                if (actionId == EditorInfo.IME_ACTION_SEND) {
                    Firebase message = firebase.child("UserMessages").child(SIMSerialNumber);
                    Firebase messages = message.child("Messages").push();
                    messages.child("message").setValue("poop");
                    Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    messages.child("lat").setValue(location.getLatitude());
                    messages.child("lng").setValue(location.getLongitude());
                    messages.child("time").setValue(location.getTime());
                    handled = true;
                }
                return handled;
            }
        });

        SetupLocationListener();
    }

    private void SetupLocationListener() {
        Location location = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);

        PushLocation(location);

        LocationListener locationListener = new LocationListener() {
            public void onLocationChanged(Location location) {
                PushLocation(location);
            }

            public void onStatusChanged(String provider, int status, Bundle extras) {
                Log.i("SuperGuide", "location changed");
            }

            public void onProviderEnabled(String provider) {
                Log.i("SuperGuide","location enabled");
            }

            public void onProviderDisabled(String provider) {
                Log.i("SuperGuide","location disabled");
            }
        };

        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 30000, 1, locationListener);
    }

    private void PushLocation(Location location) {
        if (location  != null) {
            Firebase position = firebase.child("Position").child(SIMSerialNumber);
            Firebase trackings = position.child("Trackings").push();
            trackings.child("lat").setValue(location.getLatitude());
            trackings.child("lng").setValue(location.getLongitude());
            trackings.child("time").setValue(location.getTime());
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_settings) {
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
}
