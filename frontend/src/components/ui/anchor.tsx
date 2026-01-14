import * as React from "react"

export const Anchor = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => {
  return <a ref={ref} {...props} />
})

Anchor.displayName = "Anchor"
