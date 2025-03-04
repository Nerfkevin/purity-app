import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export interface Step {
  id: string;
  title: string;
}

interface ProgressStepperProps {
  steps: Step[];
  currentStep: number;
  onStepPress?: (index: number) => void;
  allowNavigation?: boolean;
}

export default function ProgressStepper({
  steps,
  currentStep,
  onStepPress,
  allowNavigation = false,
}: ProgressStepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <View 
                  style={[
                    styles.connector,
                    isCompleted ? styles.completedConnector : {}
                  ]} 
                />
              )}
              
              <TouchableOpacity
                disabled={!allowNavigation || (!isCompleted && index !== currentStep)}
                onPress={() => onStepPress && onStepPress(index)}
                style={styles.stepButton}
              >
                <View 
                  style={[
                    styles.stepIndicator,
                    isActive ? styles.activeStep : {},
                    isCompleted ? styles.completedStep : {},
                  ]}
                >
                  <Text 
                    style={[
                      styles.stepNumber,
                      (isActive || isCompleted) ? styles.activeStepNumber : {},
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <Text 
                  style={[
                    styles.stepTitle,
                    isActive ? styles.activeStepTitle : {},
                    isCompleted ? styles.completedStepTitle : {},
                  ]}
                >
                  {step.title}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepButton: {
    alignItems: 'center',
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  activeStep: {
    backgroundColor: '#a2d2ff',
    borderColor: '#5b9bd5',
  },
  completedStep: {
    backgroundColor: '#5b9bd5',
    borderColor: '#5b9bd5',
  },
  stepNumber: {
    color: '#555',
    fontSize: 14,
    fontWeight: '600',
  },
  activeStepNumber: {
    color: '#fff',
  },
  stepTitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },
  activeStepTitle: {
    color: '#5b9bd5',
    fontWeight: '600',
  },
  completedStepTitle: {
    color: '#5b9bd5',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
  },
  completedConnector: {
    backgroundColor: '#5b9bd5',
  },
}); 