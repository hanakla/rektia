import Context from './Context'
import Replaceable from './Replaceable'

interface State {}

/**
 * Controller
 *
 * ## Life cycle
 * - _beforeActions
 * - _before()
 * - <Matched to route action>
 * - _after()
 */
export type Action = (ctx: Context, next: () => Promise<any>) => void

export default abstract class Controller extends Replaceable<State> {
    public _aroundActions: Action[]
    public _around() {}
}
