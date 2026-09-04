export function deliveryTypeLabel(type: string): string {
  switch (type) {
    case "LINK":
      return "Invite link";
    case "CREDENTIALS":
      return "Credentials";
    case "ACTIVATION_KEY":
      return "Activation key";
    default:
      return "Instant";
  }
}
