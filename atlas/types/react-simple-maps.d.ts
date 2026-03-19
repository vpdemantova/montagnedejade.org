declare module "react-simple-maps" {
  import type { ComponentType, ReactNode, SVGProps } from "react"

  export interface ComposableMapProps {
    projection?:       string
    projectionConfig?: Record<string, unknown>
    style?:            React.CSSProperties
    width?:            number
    height?:           number
    children?:         ReactNode
  }

  export interface GeographiesProps {
    geography: string | object
    children:  (props: { geographies: unknown[] }) => ReactNode
  }

  export interface GeographyProps extends SVGProps<SVGPathElement> {
    geography: unknown
    style?:    { default?: object; hover?: object; pressed?: object }
  }

  export interface MarkerProps {
    coordinates: [number, number]
    children?:   ReactNode
  }

  export const ComposableMap: ComponentType<ComposableMapProps>
  export const Geographies:   ComponentType<GeographiesProps>
  export const Geography:     ComponentType<GeographyProps>
  export const Marker:        ComponentType<MarkerProps>
  export const Sphere:        ComponentType<SVGProps<SVGPathElement>>
  export const Graticule:     ComponentType<SVGProps<SVGPathElement>>
  export const ZoomableGroup: ComponentType<{ children?: ReactNode }>
}
