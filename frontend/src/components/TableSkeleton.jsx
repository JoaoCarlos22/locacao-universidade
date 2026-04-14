export default function TableSkeleton({ rows = 5, columns = 5 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <tr key={`skeleton-${rowIndex}`}>
      {Array.from({ length: columns }).map((__, columnIndex) => (
        <td key={`skeleton-${rowIndex}-${columnIndex}`}>
          <span className="skeleton-line" />
        </td>
      ))}
    </tr>
  ))
}