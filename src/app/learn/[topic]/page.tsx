'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

const topicContent: Record<string, { title: string; description: string; sections: { title: string; content: string }[] }> = {
  algebra: {
    title: 'Algebra',
    description: 'Master equations, inequalities, polynomials, and functional equations.',
    sections: [
      { title: 'Linear Equations', content: 'Learn to solve linear equations of the form $ax + b = c$ where $a \\neq 0$.' },
      { title: 'Quadratic Equations', content: 'The quadratic formula $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ gives the roots of $ax^2 + bx + c = 0$.' },
      { title: 'Polynomial Identities', content: 'Important identities include $(a+b)^2 = a^2 + 2ab + b^2$ and $(a+b)(a-b) = a^2 - b^2$.' },
    ]
  },
  geometry: {
    title: 'Geometry',
    description: 'Explore Euclidean geometry, transformations, and complex numbers.',
    sections: [
      { title: 'Cyclic Quadrilaterals', content: 'A quadrilateral is cyclic if and only if opposite angles sum to $180°$.' },
      { title: 'Power of a Point', content: 'For point $P$ and circle with center $O$ and radius $r$: $\\text{Pow}(P) = PO^2 - r^2$.' },
      { title: 'Similar Triangles', content: 'Two triangles are similar if their corresponding angles are equal.' },
    ]
  },
  'number-theory': {
    title: 'Number Theory',
    description: 'Study divisibility, modular arithmetic, and Diophantine equations.',
    sections: [
      { title: 'Divisibility Rules', content: 'A number is divisible by 3 if the sum of its digits is divisible by 3.' },
      { title: 'Modular Arithmetic', content: 'If $a \\equiv b \\pmod{m}$ and $c \\equiv d \\pmod{m}$, then $a+c \\equiv b+d \\pmod{m}$.' },
      { title: 'GCD and LCM', content: 'For any positive integers $a$ and $b$: $\\gcd(a,b) \\times \\text{lcm}(a,b) = a \\times b$.' },
    ]
  },
  combinatorics: {
    title: 'Combinatorics',
    description: 'Learn counting, graph theory, and extremal combinatorics.',
    sections: [
      { title: 'Permutations', content: 'The number of ways to arrange $n$ distinct objects is $n!$.' },
      { title: 'Combinations', content: '$\\binom{n}{k} = \\frac{n!}{k!(n-k)!}$ counts ways to choose $k$ items from $n$.' },
      { title: 'Pigeonhole Principle', content: 'If $n+1$ pigeons are in $n$ holes, at least one hole has $\\geq 2$ pigeons.' },
    ]
  }
}

export default function TopicPage() {
  const params = useParams()
  const topic = params.topic as string
  const content = topicContent[topic] || { title: 'Topic Not Found', description: '', sections: [] }

  return (
    <section className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-3">
        <Link href="/learn" className="hover:text-electric-400 cursor-pointer font-medium transition-colors">Curriculum</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
        </svg>
        <span className="text-[var(--text-primary)] font-medium">{content.title}</span>
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">{content.title}</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-6">{content.description}</p>

      {/* Content Sections */}
      <div className="space-y-4">
        {content.sections.map((section, index) => (
          <div key={index} className="card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">{section.title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      {/* Practice Button */}
      <div className="mt-8 flex justify-end">
        <Link 
          href="/practice" 
          className="btn-primary px-6 py-2.5 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-transform"
        >
          Practice This Topic
        </Link>
      </div>
    </section>
  )
}
