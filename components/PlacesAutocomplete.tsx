import React, { useState, forwardRef, useImperativeHandle, RefObject } from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';


const GOOGLE_API_KEY = 'AIzaSyD9AOX5rjhxoThJDlVYPtkCtLNg7Vivpls'; 

type PlacesAutocompleteInputHandle = {
  setQueryText: (text: string) => void;
  clear: () => void;
  focus: () => void;
  blur: () => void;
};

type PlacesAutocompleteInputProps = {
  onQueryChange: (query: string) => void;
  onPredictionsReady: (predictions: any) => void;
  initialQuery?: string;
};

const PlacesAutocompleteInput = React.forwardRef<PlacesAutocompleteInputHandle, PlacesAutocompleteInputProps>(
  ({ onQueryChange, onPredictionsReady, initialQuery = '' }, ref) => {
    const [query, setQuery] = useState(initialQuery);
    const [isFetching, setIsFetching] = useState(false);
    const textInputRef = React.useRef<TextInput>(null);

    // Expose methods to parent via useImperativeHandle
    useImperativeHandle(ref, () => ({
        setQueryText: (text) => {
            setQuery(text);
        },
        clear: () => {
            setQuery('');
            if (textInputRef.current) {
                textInputRef.current.clear();
            }
        },
        focus: () => {
            if (textInputRef.current) {
                textInputRef.current.focus();
            }
        },
        blur: () => {
            if (textInputRef.current) {
                textInputRef.current.blur();
            }
        }
    }));

    const fetchPredictions = async (input: string) => {
        setQuery(input);
        onQueryChange(input); // Notify parent about query change

        if (input.length < 2) {
            onPredictionsReady([]); // Clear predictions in parent
            return;
        }

        setIsFetching(true);
        try {
            // Using components=country:in for India
            const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                input
            )}&key=${GOOGLE_API_KEY}&components=country:in`;
            const res = await fetch(url);
            const json = await res.json();

            if (json.status === 'OK') {
                onPredictionsReady(json.predictions || []); // Pass predictions to parent
            } else {
                console.error('Google Places Autocomplete Error:', json.status, json.error_message);
                onPredictionsReady([]);
            }
        } catch (error) {
            console.error('Error fetching place predictions:', error);
            onPredictionsReady([]);
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                ref={textInputRef}
                placeholder="Search salon address"
                value={query}
                onChangeText={fetchPredictions}
                style={styles.input}
            />
            {isFetching && (
                <ActivityIndicator size="small" color="#0000ff" style={styles.loadingIndicator} />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        position: 'relative', // Needed for absolute positioning of loading indicator
        marginBottom: 16, // Default spacing for the input itself
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
    },
    loadingIndicator: {
        position: 'absolute',
        right: 10,
        top: 10, // Adjust to align with text input
    },
});

export default PlacesAutocompleteInput;