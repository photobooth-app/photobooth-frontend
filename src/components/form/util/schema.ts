import { type ControlElement, type JsonSchema, Resolve, type UISchemaElement } from '@jsonforms/core'

const PRIMITIVE_TYPES = ['string', 'number', 'integer']
const PATH_FORMATS = ['path', 'file-path', 'directory-path']

const resolveRef = (schema: JsonSchema, rootSchema: JsonSchema): JsonSchema =>
  typeof schema.$ref === 'string' ? (Resolve.schema(rootSchema, schema.$ref, rootSchema) ?? schema) : schema

/** const properties (like discriminators of tagged unions) cannot be changed, so there is no point in showing an input for them */
export const isConstProperty = (schema: JsonSchema | undefined): boolean => !!schema && schema.const !== undefined

/** removes controls of const properties from a layout's elements */
export const withoutConstControls = (elements: UISchemaElement[], schema: JsonSchema): UISchemaElement[] =>
  elements.filter(element => {
    const scope = (element as ControlElement).scope
    const name = element.type === 'Control' && scope?.match(/^#\/properties\/([^/]+)$/)?.[1]
    return !name || !isConstProperty(schema.properties?.[decodeURIComponent(name)])
  })

/** the primitive part of a property, also for optional properties like `str | None` (anyOf string/null) */
const primitiveOf = (property: JsonSchema): JsonSchema | undefined => {
  if (PRIMITIVE_TYPES.includes(property.type as string)) return property
  return property.anyOf?.find(sub => PRIMITIVE_TYPES.includes(sub.type as string))
}

/** first property that is a primitive and not const, used to label items */
const firstLabelProperty = (schema: JsonSchema): { name: string; schema: JsonSchema } | undefined => {
  for (const [name, property] of Object.entries(schema.properties ?? {})) {
    if (isConstProperty(property)) continue
    const primitive = primitiveOf(property)
    if (primitive) return { name, schema: primitive }
  }
  return undefined
}

/** variant of a oneOf/anyOf schema matching the data, determined by the variants' const properties (discriminator) */
const matchingVariant = (schema: JsonSchema, data: unknown, rootSchema: JsonSchema): JsonSchema | undefined => {
  const variants = (schema.oneOf ?? schema.anyOf ?? []).map(variant => resolveRef(variant, rootSchema))
  const record = (data ?? {}) as Record<string, unknown>
  return variants.find(variant => {
    const consts = Object.entries(variant.properties ?? {}).filter(([, property]) => isConstProperty(property))
    return consts.length > 0 && consts.every(([name, property]) => record[name] === property.const)
  })
}

const formatLabelValue = (value: unknown, schema?: JsonSchema): string => {
  if (typeof value !== 'string' && typeof value !== 'number') return ''
  if (Number.isNaN(value)) return ''
  const text = String(value)
  return schema?.format && PATH_FORMATS.includes(schema.format) ? (text.split(/[\\/]/).pop() ?? text) : text
}

/**
 * Label of an array item: value of the first primitive property. Items of tagged unions (oneOf/anyOf) are labeled
 * with the variant's title and the value of the variant's first primitive property, like "Text: Hello".
 * Returns undefined if no label can be derived.
 */
export const arrayItemLabel = (itemsSchema: JsonSchema, data: unknown, rootSchema: JsonSchema): string | undefined => {
  const items = resolveRef(itemsSchema, rootSchema)
  if (!items.oneOf && !items.anyOf) {
    const property = firstLabelProperty(items)
    return property && formatLabelValue((data as Record<string, unknown> | undefined)?.[property.name], property.schema)
  }

  const variant = matchingVariant(items, data, rootSchema)
  if (!variant) return undefined
  const property = firstLabelProperty(variant)
  const value = property ? formatLabelValue((data as Record<string, unknown>)[property.name], property.schema) : ''
  const title = variant.title ?? ''
  return [title, value].filter(Boolean).join(': ')
}
