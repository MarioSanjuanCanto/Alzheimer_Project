import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Text,
  } from 'npm:@react-email/components@0.0.22'
  import * as React from 'npm:react@18.3.1'
  
  interface MagicLinkEmailProps {
    supabase_url: string
    email_action_type: string
    redirect_to: string
    token_hash: string
    token: string
  }
  
  export const MagicLinkEmail = ({
    token,
    supabase_url,
    email_action_type,
    redirect_to,
    token_hash,
  }: MagicLinkEmailProps) => (
    <Html>
      <Head />
      <Preview>You got an invite!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h2}>You got an invite</Heading>
          <Link
            href={redirect_to}
            target="_blank"
            style={{
              ...link,
              display: 'block',
              marginBottom: '16px',
            }}
          >
            Click here to log in with this magic link
          </Link>
          <Text
            style={{
              ...text,
              color: '#707070',
              marginTop: '14px',
              marginBottom: '16px',
            }}
          >
            If you didn&apos;t try to login, you can safely ignore this email.
          </Text>
          <Text style={footer}>
          
          </Text>
        </Container>
      </Body>
    </Html>
  )
  
  export default MagicLinkEmail
  
  const main = {
    backgroundColor: '#FAFAF7',
  }
  
  const container = {
    maxWidth: '480px',
    margin: '0 auto',
    backgroundColor: '#FAFAF7',
    borderRadius: '12px',
    padding: '32px',
  }
  
  const h2 = {
    color: '#1B4332',
    fontFamily:
      "Fraunces, Georgia, Nunito, Helvetica",
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '16px',
    padding: '0',
  }
  
  const link = {
    color: '#2754C5',
    fontFamily:
      "Nunito', Helvetica, Arial, sans-serif",
    fontSize: '20px',
    textDecoration: 'underline',
  }
  
  const text = {
    color: '#373737',
    fontFamily:
     "Nunito', Helvetica, Arial, sans-serif",
    fontSize: '20px',
    margin: '24px 0',
  }
  
  const footer = {
    color: '#898989',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
    fontSize: '12px',
    lineHeight: '22px',
    marginTop: '12px',
    marginBottom: '24px',
  }
  