import { useState } from 'react'
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useSignIn, useSignUp } from '@/lib/mockAuth'
import { useRouter } from 'expo-router'
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme'

type Mode = 'login' | 'register'

export default function LoginScreen() {
  const router = useRouter()
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn()
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!signInLoaded) return
    setLoading(true)
    const result = await signIn.create({ identifier: email, password })
    await setSignInActive({ session: result.createdSessionId })
    setLoading(false)
    router.replace('/(tabs)')
  }

  const handleRegister = async () => {
    if (!signUpLoaded) return
    setLoading(true)
    const result = await signUp.create({ emailAddress: email, password, username })
    await setSignUpActive({ session: result.createdSessionId })
    setLoading(false)
    router.replace('/(tabs)')
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Text style={styles.logo}>AutoDex</Text>
        <Text style={styles.subtitle}>Pokédex social de autos</Text>

        <View style={styles.tabs}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <Pressable key={m} style={[styles.modeTab, mode === m && styles.modeTabActive]} onPress={() => setMode(m)}>
              <Text style={[styles.modeLabel, mode === m && styles.modeLabelActive]}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.form}>
          {mode === 'register' && (
            <TextInput style={styles.input} placeholder="Nombre de usuario" placeholderTextColor={Colors.textMuted} value={username} onChangeText={setUsername} autoCapitalize="none" />
          )}
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={Colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor={Colors.textMuted} value={password} onChangeText={setPassword} secureTextEntry />

          <Pressable style={[styles.submitBtn, loading && styles.disabled]} onPress={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.text} /> : (
              <Text style={styles.submitText}>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: Spacing.xl },
  logo: { color: Colors.text, fontSize: FontSize.hero, fontWeight: FontWeight.black, textAlign: 'center', marginBottom: 4 },
  subtitle: { color: Colors.textMuted, fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.xl },
  tabs: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.lg },
  modeTab: { flex: 1, paddingVertical: Spacing.sm, borderRadius: Radius.md, alignItems: 'center' },
  modeTabActive: { backgroundColor: Colors.primary },
  modeLabel: { color: Colors.textSecondary, fontWeight: FontWeight.medium, fontSize: FontSize.md },
  modeLabelActive: { color: Colors.text, fontWeight: FontWeight.bold },
  form: { gap: Spacing.sm },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, color: Colors.text, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  disabled: { opacity: 0.6 },
  submitText: { color: Colors.text, fontSize: FontSize.md, fontWeight: FontWeight.bold },
})
