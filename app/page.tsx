import { getElements } from '@/lib/elements'
import { PeriodicTableApp } from '@/components/PeriodicTableApp'

export default function Page() {
  const elements = getElements()
  return <PeriodicTableApp elements={elements} />
}
