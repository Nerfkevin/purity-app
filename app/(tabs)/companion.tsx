import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send, User, ChevronRight } from 'lucide-react-native';

export default function CompanionScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: "Hello! I'm your spiritual companion. How can I support you today?",
      isUser: false,
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef(null);

  const suggestedPrompts = [
    "I'm struggling with temptation right now",
    "How can I avoid triggers?",
    "Share a Bible verse about strength",
    "Help me create a plan for accountability"
  ];

  const handleSend = () => {
    if (inputText.trim() === '') return;
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    
    // Simulate AI response
    setTimeout(() => {
      let responseText = '';
      
      if (inputText.toLowerCase().includes('temptation') || inputText.toLowerCase().includes('struggling')) {
        responseText = "I understand those struggles. Remember 1 Corinthians 10:13: 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.' Would you like to discuss specific strategies to overcome this temptation?";
      } else if (inputText.toLowerCase().includes('triggers')) {
        responseText = "Consider setting up accountability software, establishing usage time limits, and being intentional about following accounts that uplift rather than tempt. Jesus taught in Matthew 5:29-30 about the importance of removing things that cause us to stumble. What specific triggers are most challenging for you?";
      } else if (inputText.toLowerCase().includes('bible') || inputText.toLowerCase().includes('verse')) {
        responseText = "Here's a powerful verse about strength: 'I can do all this through him who gives me strength.' - Philippians 4:13. This reminds us that our strength comes from God. Would you like to explore this verse further?";
      } else if (inputText.toLowerCase().includes('accountability') || inputText.toLowerCase().includes('plan')) {
        responseText = "Accountability is crucial. Proverbs 27:17 says, 'As iron sharpens iron, so one person sharpens another.' Consider finding a trusted friend or mentor, setting up regular check-ins, being honest about struggles, and using technology tools like accountability software. Would you like help with any specific part of this plan?";
      } else {
        responseText = "Thank you for sharing. Remember that God's grace is sufficient for you, and His power is made perfect in weakness (2 Corinthians 12:9). Would you like to explore any specific scriptures or strategies related to what you've shared?";
      }
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    }, 1000);
  };

  const handlePromptSelect = (prompt) => {
    setInputText(prompt);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Companion</Text>
        <TouchableOpacity style={styles.profileButton}>
          <User size={20} color="#d9b64e" />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(message => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.companionBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : styles.companionMessageText
              ]}>
                {message.text}
              </Text>
            </View>
          ))}
        </ScrollView>
        
        {messages.length === 1 && (
          <View style={styles.promptsContainer}>
            <Text style={styles.promptsTitle}>Suggested Topics</Text>
            {suggestedPrompts.map((prompt, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.promptButton}
                onPress={() => handlePromptSelect(prompt)}
              >
                <Text style={styles.promptText}>{prompt}</Text>
                <ChevronRight size={16} color="#a89a5b" />
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[
              styles.sendButton, 
              {backgroundColor: inputText.trim() ? '#d9b64e' : '#d9b64e80'}
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Send size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7eed2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0e8c9',
  },
  headerTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#d9b64e',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fce59f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: '#d9b64e',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  companionBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  companionMessageText: {
    color: '#5c5436',
  },
  promptsContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  promptsTitle: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '600',
    fontSize: 16,
    color: '#5c5436',
    marginBottom: 12,
  },
  promptButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fce59f30',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  promptText: {
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontWeight: '500',
    fontSize: 14,
    color: '#5c5436',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0e8c9',
  },
  input: {
    flex: 1,
    backgroundColor: '#fce59f30',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    fontSize: 16,
    color: '#5c5436',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});